import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { ConfirmacaoCandidaturaEmail } from "@/emails/confirmacao-candidatura";

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const createSchema = z.object({
  vagaId: z.string(),
  curriculo: z.string().url().optional(),
  carta: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { vagaId, curriculo, carta } = parsed.data;

  const vaga = await prisma.vaga.findUnique({
    where: { id: vagaId, ativa: true },
    include: { empresa: true },
  });

  if (!vaga) {
    return NextResponse.json({ error: "Vaga não encontrada ou inativa" }, { status: 404 });
  }

  try {
    const candidatura = await prisma.candidatura.create({
      data: {
        vagaId,
        candidatoId: user.id,
        curriculo,
        carta,
      },
    });

    // Send confirmation email (non-blocking)
    if (user.email) {
      getResend().emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: `Candidatura enviada: ${vaga.titulo}`,
        react: ConfirmacaoCandidaturaEmail({
          candidatoNome: user.user_metadata?.name ?? user.email,
          vagaTitulo: vaga.titulo,
          empresaNome: vaga.empresa.nome,
          vagaSlug: vaga.slug,
          appUrl: process.env.NEXT_PUBLIC_APP_URL!,
        }),
      }).catch(console.error);
    }

    return NextResponse.json(candidatura, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Você já se candidatou a esta vaga" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const candidaturas = await prisma.candidatura.findMany({
    where: { candidatoId: user.id },
    include: {
      vaga: {
        include: {
          empresa: {
            select: { nome: true, logo: true, slug: true },
          },
        },
      },
    },
    orderBy: { criadaEm: "desc" },
  });

  return NextResponse.json(candidaturas);
}
