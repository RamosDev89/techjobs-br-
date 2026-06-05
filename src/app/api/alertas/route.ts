import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

const createAlertaSchema = z.object({
  filtros: z.object({
    cargo: z.string().optional(),
    modalidade: z.string().optional(),
    nivel: z.string().optional(),
    tipoContrato: z.string().optional(),
    q: z.string().optional(),
    estado: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createAlertaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const alerta = await prisma.alertaVaga.create({
    data: {
      usuarioId: user.id,
      email: user.email,
      filtros: parsed.data.filtros,
    },
  });

  return NextResponse.json(alerta, { status: 201 });
}

export async function GET(_request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const alertas = await prisma.alertaVaga.findMany({
    where: { usuarioId: user.id },
    orderBy: { criadaEm: "desc" },
  });

  return NextResponse.json(alertas);
}

export async function DELETE(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.alertaVaga.deleteMany({ where: { id, usuarioId: user.id } });
  return NextResponse.json({ ok: true });
}
