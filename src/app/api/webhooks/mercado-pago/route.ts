import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function validateSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";

  // Parse "ts=1234,v1=abc..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Extrair data.id do body pra montar o manifest
  let dataId = "";
  try {
    const parsed = JSON.parse(rawBody) as { data?: { id?: string } };
    dataId = String(parsed?.data?.id ?? "");
  } catch {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");

  return digest === v1;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!validateSignature(request, rawBody)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let body: { action?: string; data?: { id?: string } };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const action = body.action;
  const paymentId = body.data?.id;

  // Sempre 200 pra MP não fazer retry em ações que não nos interessam
  if (action !== "payment.updated" && action !== "payment.created") {
    return NextResponse.json({ ok: true });
  }
  if (!paymentId) return NextResponse.json({ ok: true });

  // Buscar pagamento diretamente na API MP (mais confiável que confiar no body)
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
  });

  if (!mpRes.ok) {
    console.error("MP API error", mpRes.status);
    return NextResponse.json({ ok: true }); // 200 pra MP não retentar
  }

  const payment = await mpRes.json() as {
    status: string;
    external_reference: string;
  };

  if (payment.status !== "approved") {
    // Marcar como FALHOU se rejected
    if (payment.status === "rejected" && payment.external_reference) {
      await prisma.pedido.updateMany({
        where: { id: payment.external_reference },
        data: { status: "FALHOU" },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const pedidoId = payment.external_reference;
  if (!pedidoId) return NextResponse.json({ ok: true });

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido || pedido.status === "PAGO") return NextResponse.json({ ok: true });

  // Ativar vaga + atualizar pedido atomicamente
  await prisma.$transaction([
    prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: "PAGO", mpPaymentId: String(paymentId) },
    }),
    prisma.vaga.update({
      where: { id: pedido.vagaId },
      data: { ativa: true },
    }),
  ]);

  console.log(`Pedido ${pedidoId} pago — vaga ${pedido.vagaId} ativada`);
  return NextResponse.json({ ok: true });
}
