import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  titulo: z.string().min(3).max(200).optional(),
  descricao: z.string().min(50).optional(),
  modalidade: z.enum(["PRESENCIAL", "HIBRIDA", "REMOTA", "REMOTA_INTERNACIONAL"]).optional(),
  nivel: z.enum(["ESTAGIO", "JUNIOR", "PLENO", "SENIOR", "ESPECIALISTA", "GERENCIA"]).optional(),
  cargo: z
    .enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DEVOPS", "DATA", "QA", "DESIGN", "PRODUTO", "SEGURANCA", "IA", "OUTRO"])
    .optional(),
  tipoContrato: z.enum(["CLT", "PJ", "FREELANCE", "ESTAGIO"]).optional(),
  salarioMin: z.number().optional(),
  salarioMax: z.number().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  tecnologias: z.array(z.string()).optional(),
  beneficios: z.array(z.string()).optional(),
  ativa: z.boolean().optional(),
  destacada: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vaga = await prisma.vaga.findUnique({
    where: { id },
    include: {
      empresa: true,
      _count: { select: { candidaturas: true } },
    },
  });

  if (!vaga) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }

  // Increment views (non-blocking)
  prisma.vaga
    .update({ where: { id }, data: { visualizacoes: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.json(vaga);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body: unknown = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const vaga = await prisma.vaga.update({
      where: { id },
      data: parsed.data,
      include: { empresa: true },
    });

    return NextResponse.json(vaga);
  } catch {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.vaga.update({
      where: { id },
      data: { ativa: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }
}
