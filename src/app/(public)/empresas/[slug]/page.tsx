import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Globe, ArrowLeft, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VagaCard } from "@/components/vagas/VagaCard";
import { prisma } from "@/lib/prisma";
import type { VagaComEmpresa } from "@/types";

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

const TAMANHO_LABEL: Record<string, string> = {
  STARTUP: "Startup",
  PME: "PME",
  GRANDE: "Grande empresa",
  ENTERPRISE: "Enterprise",
};

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEmpresa(slug: string) {
  return prisma.empresa.findUnique({
    where: { slug },
    include: {
      vagas: {
        where: {
          ativa: true,
          OR: [{ expiradaEm: null }, { expiradaEm: { gt: new Date() } }],
        },
        orderBy: [{ destacada: "desc" }, { criadaEm: "desc" }],
        take: 50,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const empresa = await prisma.empresa.findUnique({
    where: { slug },
    select: { nome: true, descricao: true, localizacao: true },
  });
  if (!empresa) return {};

  const title = `${empresa.nome} — Vagas de tech | TechJobs BR`;
  const description =
    empresa.descricao ??
    `Veja as vagas abertas de tecnologia na ${empresa.nome}${empresa.localizacao ? ` em ${empresa.localizacao}` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/empresas/${slug}` },
    openGraph: { title, description },
  };
}

export default async function EmpresaPage({ params }: Props) {
  const { slug } = await params;
  const empresa = await getEmpresa(slug);
  if (!empresa) notFound();

  const vagasAtivas = empresa.vagas as unknown as VagaComEmpresa[];
  const empresaEmbed = {
    id: empresa.id,
    nome: empresa.nome,
    slug: empresa.slug,
    logo: empresa.logo,
    tamanho: empresa.tamanho,
    localizacao: empresa.localizacao,
    verificada: empresa.verificada,
  };
  const vagasComEmpresa: VagaComEmpresa[] = vagasAtivas.map((v) => ({
    ...v,
    empresa: empresaEmbed,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: empresa.nome,
    url: empresa.site ?? undefined,
    description: empresa.descricao ?? undefined,
    logo: empresa.logo ?? undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link
          href="/empresas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todas as empresas
        </Link>
      </div>

      {/* Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {empresa.logo ? (
              <img
                src={empresa.logo}
                alt={empresa.nome}
                className="h-16 w-16 rounded-xl object-contain border bg-white p-1 shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl border bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{empresa.nome}</h1>
                {empresa.verificada && <Badge>Verificada</Badge>}
              </div>

              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {empresa.localizacao && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {empresa.localizacao}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {TAMANHO_LABEL[empresa.tamanho] ?? empresa.tamanho}
                </span>
                {empresa.site && (
                  <a
                    href={empresa.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Site
                  </a>
                )}
              </div>

              {empresa.descricao && (
                <p className="text-sm text-muted-foreground mt-3">{empresa.descricao}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vagas */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {vagasComEmpresa.length > 0
            ? `${vagasComEmpresa.length} vaga${vagasComEmpresa.length !== 1 ? "s" : ""} abertas`
            : "Nenhuma vaga aberta no momento"}
        </h2>

        {vagasComEmpresa.length > 0 ? (
          <div className="space-y-4">
            {vagasComEmpresa.map((vaga) => (
              <VagaCard key={vaga.id} vaga={vaga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Esta empresa não tem vagas abertas no momento.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/vagas">Ver todas as vagas</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
