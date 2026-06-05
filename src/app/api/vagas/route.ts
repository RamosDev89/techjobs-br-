import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";
import { slugify } from "@/lib/utils";
import { buildCacheKey } from "@/lib/utils";
import type { Cargo, Modalidade, Nivel, TipoContrato, Prisma } from "@prisma/client";

const querySchema = z.object({
  q: z.string().optional(),
  cargo: z.string().optional(),
  modalidade: z.string().optional(),
  nivel: z.string().optional(),
  tipoContrato: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  salarioMin: z.coerce.number().optional(),
  fonte: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const createVagaSchema = z.object({
  titulo: z.string().min(3).max(200),
  descricao: z.string().min(50),
  empresaId: z.string(),
  modalidade: z.enum(["PRESENCIAL", "HIBRIDA", "REMOTA", "REMOTA_INTERNACIONAL"]),
  nivel: z.enum(["ESTAGIO", "JUNIOR", "PLENO", "SENIOR", "ESPECIALISTA", "GERENCIA"]),
  cargo: z.enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DEVOPS", "DATA", "QA", "DESIGN", "PRODUTO", "SEGURANCA", "IA", "OUTRO"]),
  tipoContrato: z.enum(["CLT", "PJ", "FREELANCE", "ESTAGIO"]),
  salarioMin: z.number().optional(),
  salarioMax: z.number().optional(),
  moeda: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  tecnologias: z.array(z.string()).default([]),
  beneficios: z.array(z.string()).default([]),
  expiradaEm: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { q, cargo, modalidade, nivel, tipoContrato, estado, cidade, salarioMin, fonte, page, limit } = parsed.data;

  const cacheKey = buildCacheKey("vagas", parsed.data);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const where: Prisma.VagaWhereInput = {
    ativa: true,
    ...(q && {
      OR: [
        { titulo: { contains: q, mode: "insensitive" } },
        { descricao: { contains: q, mode: "insensitive" } },
        { tecnologias: { has: q } },
      ],
    }),
    ...(cargo && { cargo: cargo as Cargo }),
    ...(modalidade && { modalidade: modalidade as Modalidade }),
    ...(nivel && { nivel: nivel as Nivel }),
    ...(tipoContrato && { tipoContrato: tipoContrato as TipoContrato }),
    ...(estado && { estado: { contains: estado, mode: "insensitive" } }),
    ...(cidade && { cidade: { contains: cidade, mode: "insensitive" } }),
    ...(salarioMin && { salarioMin: { gte: salarioMin } }),
    ...(fonte && { nomeFonte: fonte }),
  };

  const [data, total] = await Promise.all([
    prisma.vaga.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
            logo: true,
            tamanho: true,
            localizacao: true,
            verificada: true,
          },
        },
      },
      orderBy: [{ destacada: "desc" }, { criadaEm: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vaga.count({ where }),
  ]);

  const response = {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  await cacheSet(cacheKey, response, 300);

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = createVagaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const baseSlug = slugify(`${data.titulo} ${Date.now()}`);

    const vaga = await prisma.vaga.create({
      data: {
        ...data,
        slug: baseSlug,
        expiradaEm: data.expiradaEm ? new Date(data.expiradaEm) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { empresa: true },
    });

    return NextResponse.json(vaga, { status: 201 });
  } catch (err) {
    console.error("[POST /api/vagas]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
