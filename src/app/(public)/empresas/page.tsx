import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  title: "Empresas de tecnologia contratando no Brasil | TechJobs BR",
  description:
    "Veja todas as empresas de tech com vagas abertas no Brasil. Startups, PMEs e grandes empresas contratando desenvolvedores, designers e mais.",
  alternates: { canonical: `${APP_URL}/empresas` },
};

const TAMANHO_LABEL: Record<string, string> = {
  STARTUP: "Startup",
  PME: "PME",
  GRANDE: "Grande empresa",
  ENTERPRISE: "Enterprise",
};

async function getEmpresas() {
  const empresas = await prisma.empresa.findMany({
    where: {
      vagas: {
        some: {
          ativa: true,
          OR: [{ expiradaEm: null }, { expiradaEm: { gt: new Date() } }],
        },
      },
    },
    select: {
      id: true,
      nome: true,
      slug: true,
      logo: true,
      site: true,
      descricao: true,
      tamanho: true,
      localizacao: true,
      verificada: true,
      _count: {
        select: {
          vagas: {
            where: {
              ativa: true,
              OR: [{ expiradaEm: null }, { expiradaEm: { gt: new Date() } }],
            },
          },
        },
      },
    },
    orderBy: { nome: "asc" },
  });

  return empresas.sort((a, b) => b._count.vagas - a._count.vagas);
}

export default async function EmpresasPage() {
  const empresas = await getEmpresas();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Empresas contratando em tech</h1>
        <p className="text-muted-foreground">
          {empresas.length} empresas com vagas abertas no Brasil
        </p>
      </div>

      {empresas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma empresa com vagas ativas no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((empresa) => (
            <Link key={empresa.id} href={`/empresas/${empresa.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    {empresa.logo ? (
                      <img
                        src={empresa.logo}
                        alt={empresa.nome}
                        className="h-12 w-12 rounded-lg object-contain border bg-white p-1 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-semibold text-sm truncate">{empresa.nome}</h2>
                      {empresa.localizacao && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {empresa.localizacao}
                        </p>
                      )}
                    </div>
                  </div>

                  {empresa.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {empresa.descricao}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {empresa._count.vagas} vaga{empresa._count.vagas !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TAMANHO_LABEL[empresa.tamanho] ?? empresa.tamanho}
                      </Badge>
                    </div>
                    {empresa.verificada && (
                      <Badge className="text-xs">Verificada</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
