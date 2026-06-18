import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getPeriodoDate } from "@/lib/utils";
import { VagaGrid } from "@/components/vagas/VagaGrid";
import { VagaFiltros } from "@/components/vagas/VagaFiltros";
import { Skeleton } from "@/components/ui/skeleton";
import type { VagaComEmpresa } from "@/types";
import type { Cargo, Modalidade, Nivel, TipoContrato, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vagas de Tecnologia",
  description:
    "Busque vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais. Filtre por cargo, modalidade, nível, contrato e salário.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br"}/vagas`,
  },
  openGraph: {
    title: "Vagas de Tecnologia no Brasil | TechJobs BR",
    description:
      "Busque vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais.",
  },
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    cargo?: string;
    modalidade?: string;
    nivel?: string;
    tipoContrato?: string;
    estado?: string;
    cidade?: string;
    fonte?: string;
    periodo?: string;
    page?: string;
  }>;
}

async function fetchVagas(
  sp: Awaited<PageProps["searchParams"]>
): Promise<{ vagas: VagaComEmpresa[]; total: number }> {
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = 20;

  const where: Prisma.VagaWhereInput = {
    ativa: true,
    ...(sp.q && {
      OR: [
        { titulo: { contains: sp.q, mode: "insensitive" } },
        { descricao: { contains: sp.q, mode: "insensitive" } },
        { tecnologias: { has: sp.q } },
      ],
    }),
    ...(sp.cargo && { cargo: sp.cargo as Cargo }),
    ...(sp.modalidade && { modalidade: sp.modalidade as Modalidade }),
    ...(sp.nivel && { nivel: sp.nivel as Nivel }),
    ...(sp.tipoContrato && { tipoContrato: sp.tipoContrato as TipoContrato }),
    ...(sp.estado && { estado: { contains: sp.estado, mode: "insensitive" } }),
    ...(sp.cidade && { cidade: { contains: sp.cidade, mode: "insensitive" } }),
    ...(sp.fonte && { nomeFonte: sp.fonte }),
    ...(getPeriodoDate(sp.periodo) && { criadaEm: { gte: getPeriodoDate(sp.periodo) } }),
  };

  const [vagas, total] = await Promise.all([
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

  return { vagas: vagas as VagaComEmpresa[], total };
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <a href={`?page=${page - 1}`} className="px-4 py-2 text-sm border rounded-md hover:bg-accent">
          ← Anterior
        </a>
      )}
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <a href={`?page=${page + 1}`} className="px-4 py-2 text-sm border rounded-md hover:bg-accent">
          Próxima →
        </a>
      )}
    </div>
  );
}

export default async function VagasPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const { vagas, total } = await fetchVagas(sp);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vagas de Tecnologia</h1>
        <p className="text-muted-foreground mt-1">
          {total.toLocaleString("pt-BR")} vaga{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          {sp.q && ` para "${sp.q}"`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <VagaFiltros />
          </Suspense>
        </aside>

        <div>
          <VagaGrid vagas={vagas} />
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
