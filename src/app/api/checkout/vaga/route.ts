import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";
const PRECO_DESTAQUE = 297;
const DIAS_DESTAQUE = 30;

const checkoutSchema = z.object({
  // Empresa
  empresaNome: z.string().min(2).max(200),
  emailContato: z.string().email(),
  empresaSite: z.string().url().optional().or(z.literal("")),
  // Vaga
  titulo: z.string().min(3).max(200),
  descricao: z.string().min(50),
  cargo: z.enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DEVOPS", "DATA", "QA", "DESIGN", "PRODUTO", "SEGURANCA", "IA", "OUTRO"]),
  modalidade: z.enum(["PRESENCIAL", "HIBRIDA", "REMOTA", "REMOTA_INTERNACIONAL"]),
  nivel: z.enum(["ESTAGIO", "TRAINEE", "JUNIOR", "PLENO", "SENIOR", "ESPECIALISTA", "GERENCIA"]),
  tipoContrato: z.enum(["CLT", "PJ", "FREELANCE", "ESTAGIO", "TRAINEE"]),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  salarioMin: z.number().positive().optional(),
  salarioMax: z.number().positive().optional(),
  tecnologias: z.array(z.string()).default([]),
  beneficios: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Pagamento não configurado" }, { status: 503 });
  }

  const body: unknown = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Upsert empresa pelo slug do nome (evita duplicatas por digitação similar)
  const empresaSlug = slugify(d.empresaNome);
  const empresa = await prisma.empresa.upsert({
    where: { slug: empresaSlug },
    update: { nome: d.empresaNome, ...(d.empresaSite && { site: d.empresaSite }) },
    create: {
      nome: d.empresaNome,
      slug: empresaSlug,
      tamanho: "PME",
      ...(d.empresaSite && { site: d.empresaSite }),
    },
  });

  // Slug único pra vaga
  const baseSlug = slugify(`${d.titulo} ${empresa.nome}`);
  const existing = await prisma.vaga.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });
  const vagaSlug = existing.length === 0 ? baseSlug : `${baseSlug}-${existing.length}`;

  const expiresAt = new Date(Date.now() + DIAS_DESTAQUE * 24 * 60 * 60 * 1000);

  // Cria vaga inativa (ativada pelo webhook após pagamento)
  const vaga = await prisma.vaga.create({
    data: {
      titulo: d.titulo,
      slug: vagaSlug,
      descricao: d.descricao,
      empresaId: empresa.id,
      cargo: d.cargo,
      modalidade: d.modalidade,
      nivel: d.nivel,
      tipoContrato: d.tipoContrato,
      cidade: d.cidade,
      estado: d.estado,
      salarioMin: d.salarioMin,
      salarioMax: d.salarioMax,
      tecnologias: d.tecnologias,
      beneficios: d.beneficios,
      ativa: false,
      destacada: true,
      expiradaEm: expiresAt,
    },
  });

  // Cria pedido pendente
  const pedido = await prisma.pedido.create({
    data: {
      vagaId: vaga.id,
      emailContato: d.emailContato,
      valor: PRECO_DESTAQUE,
    },
  });

  // Cria preference no Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
  const preference = new Preference(client);

  const pref = await preference.create({
    body: {
      items: [
        {
          id: pedido.id,
          title: `Vaga Destaque 30 dias — ${vaga.titulo}`,
          quantity: 1,
          unit_price: PRECO_DESTAQUE,
          currency_id: "BRL",
        },
      ],
      payer: { email: d.emailContato },
      external_reference: pedido.id,
      back_urls: {
        success: `${APP_URL}/anuncie/sucesso?pedidoId=${pedido.id}`,
        failure: `${APP_URL}/anuncie/publicar?erro=pagamento`,
        pending: `${APP_URL}/anuncie/sucesso?pedidoId=${pedido.id}&pendente=true`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/webhooks/mercado-pago`,
      statement_descriptor: "TECHJOBSBR",
    },
  });

  // Salva preference ID
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { mpPreferenceId: pref.id },
  });

  return NextResponse.json({
    init_point: pref.init_point,
    pedidoId: pedido.id,
    vagaId: vaga.id,
  });
}
