import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { AlertaVagasEmail } from "@/emails/alerta-vagas";
import type { Cargo, Modalidade, Nivel, TipoContrato } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const getResend = () => new Resend(process.env.RESEND_API_KEY);

interface AlertaFiltros {
  q?: string;
  cargo?: string;
  modalidade?: string;
  nivel?: string;
  tipoContrato?: string;
  estado?: string;
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alertas = await prisma.alertaVaga.findMany({
    where: { ativo: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const alerta of alertas) {
    const filtros = alerta.filtros as AlertaFiltros;
    const since = alerta.ultimaExecucao ?? new Date(Date.now() - 6 * 60 * 60 * 1000);

    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true,
        criadaEm: { gt: since },
        ...(filtros.q && {
          OR: [
            { titulo: { contains: filtros.q, mode: "insensitive" } },
            { tecnologias: { has: filtros.q } },
          ],
        }),
        ...(filtros.cargo && { cargo: filtros.cargo as Cargo }),
        ...(filtros.modalidade && { modalidade: filtros.modalidade as Modalidade }),
        ...(filtros.nivel && { nivel: filtros.nivel as Nivel }),
        ...(filtros.tipoContrato && { tipoContrato: filtros.tipoContrato as TipoContrato }),
        ...(filtros.estado && { estado: { contains: filtros.estado, mode: "insensitive" } }),
      },
      include: {
        empresa: { select: { nome: true } },
      },
      take: 10,
    });

    if (vagas.length === 0) {
      skipped++;
      await prisma.alertaVaga.update({
        where: { id: alerta.id },
        data: { ultimaExecucao: new Date() },
      });
      continue;
    }

    await getResend().emails.send({
      from: process.env.EMAIL_FROM!,
      to: alerta.email,
      subject: `${vagas.length} nova${vagas.length > 1 ? "s" : ""} vaga${vagas.length > 1 ? "s" : ""} para você`,
      react: AlertaVagasEmail({
        vagas: vagas.map((v) => ({
          titulo: v.titulo,
          empresa: v.empresa.nome,
          modalidade: v.modalidade,
          nivel: v.nivel,
          slug: v.slug,
        })),
        appUrl: process.env.NEXT_PUBLIC_APP_URL!,
      }),
    });

    await prisma.alertaVaga.update({
      where: { id: alerta.id },
      data: { ultimaExecucao: new Date() },
    });

    sent++;
  }

  return NextResponse.json({
    alertasProcessados: alertas.length,
    emailsEnviados: sent,
    semNovasVagas: skipped,
    timestamp: new Date().toISOString(),
  });
}
