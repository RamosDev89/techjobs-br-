import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatSalary, timeAgo } from "@/lib/utils";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getVaga(slug: string) {
  return prisma.vaga.findUnique({
    where: { slug, ativa: true },
    include: { empresa: true },
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vaga = await getVaga(slug);
  if (!vaga) return { title: "Vaga não encontrada" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";
  const url = `${baseUrl}/vagas/${slug}`;
  const description = stripHtml(vaga.descricao).slice(0, 160);
  const title = `${vaga.titulo} — ${vaga.empresa.nome}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const modalidadeLabel: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDA: "Híbrida",
  REMOTA: "Remota",
  REMOTA_INTERNACIONAL: "Remota Internacional",
};

const nivelLabel: Record<string, string> = {
  ESTAGIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  GERENCIA: "Gerência",
};

const contratLabel: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCE: "Freelance",
  ESTAGIO: "Estágio",
};

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  CLT: "FULL_TIME",
  PJ: "CONTRACTOR",
  FREELANCE: "TEMPORARY",
  ESTAGIO: "INTERN",
};

function buildJobPostingSchema(vaga: NonNullable<Awaited<ReturnType<typeof getVaga>>>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";
  const isRemote = vaga.modalidade === "REMOTA" || vaga.modalidade === "REMOTA_INTERNACIONAL";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vaga.titulo,
    description: vaga.descricao,
    datePosted: (vaga.publicadaEm ?? vaga.criadaEm).toISOString(),
    validThrough: new Date(
      (vaga.publicadaEm ?? vaga.criadaEm).getTime() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
    employmentType: EMPLOYMENT_TYPE_MAP[vaga.tipoContrato] ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: vaga.empresa.nome,
      ...(vaga.empresa.site && { sameAs: vaga.empresa.site }),
      ...(vaga.empresa.logo && { logo: vaga.empresa.logo }),
    },
    url: `${baseUrl}/vagas/${vaga.slug}`,
    ...(isRemote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: { "@type": "Country", name: "Brazil" },
        }
      : {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: vaga.cidade ?? undefined,
              addressRegion: vaga.estado ?? undefined,
              addressCountry: "BR",
            },
          },
        }),
    ...(vaga.salarioMin || vaga.salarioMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: vaga.moeda ?? "BRL",
            value: {
              "@type": "QuantitativeValue",
              ...(vaga.salarioMin && { minValue: vaga.salarioMin }),
              ...(vaga.salarioMax && { maxValue: vaga.salarioMax }),
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };

  return schema;
}

export default async function VagaPage({ params }: Props) {
  const { slug } = await params;
  const vaga = await getVaga(slug);
  if (!vaga) notFound();

  // Increment views non-blocking
  prisma.vaga
    .update({ where: { id: vaga.id }, data: { visualizacoes: { increment: 1 } } })
    .catch(() => {});

  const salario = formatSalary(vaga.salarioMin, vaga.salarioMax, vaga.moeda);
  const localidade = [vaga.cidade, vaga.estado].filter(Boolean).join(", ");
  const jobPostingSchema = buildJobPostingSchema(vaga);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <div className="mb-6">
        <Link
          href="/vagas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às vagas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                  {vaga.empresa.logo ? (
                    <Image
                      src={vaga.empresa.logo}
                      alt={vaga.empresa.nome}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{vaga.titulo}</h1>
                  <Link
                    href={`/empresas/${vaga.empresa.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {vaga.empresa.nome}
                    {vaga.empresa.verificada && (
                      <CheckCircle2 className="inline ml-1 h-4 w-4 text-blue-500" />
                    )}
                  </Link>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>{modalidadeLabel[vaga.modalidade]}</Badge>
                    <Badge variant="outline">{nivelLabel[vaga.nivel]}</Badge>
                    <Badge variant="outline">{contratLabel[vaga.tipoContrato]}</Badge>
                    {vaga.nomeFonte && (
                      <Badge variant="secondary">{vaga.nomeFonte}</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                    {localidade && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />{localidade}
                      </span>
                    )}
                    {salario !== "A combinar" && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />{salario}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{timeAgo(vaga.publicadaEm ?? vaga.criadaEm)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descrição da vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: vaga.descricao.replace(/\n/g, "<br/>") }}
              />
            </CardContent>
          </Card>

          {vaga.tecnologias.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tecnologias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vaga.tecnologias.map((tech) => (
                    <Link key={tech} href={`/vagas?q=${encodeURIComponent(tech)}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tech}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {vaga.beneficios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefícios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {vaga.beneficios.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              {vaga.fonteExterna ? (
                <Button className="w-full" asChild>
                  <a href={vaga.fonteExterna} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Candidatar no {vaga.nomeFonte ?? "site original"}
                  </a>
                </Button>
              ) : (
                <Button className="w-full">Candidatar-se</Button>
              )}

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modalidade</span>
                  <span className="font-medium">{modalidadeLabel[vaga.modalidade]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nível</span>
                  <span className="font-medium">{nivelLabel[vaga.nivel]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contrato</span>
                  <span className="font-medium">{contratLabel[vaga.tipoContrato]}</span>
                </div>
                {localidade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local</span>
                    <span className="font-medium text-right">{localidade}</span>
                  </div>
                )}
                {salario !== "A combinar" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salário</span>
                    <span className="font-medium">{salario}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicada</span>
                  <span className="font-medium">{timeAgo(vaga.publicadaEm ?? vaga.criadaEm)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visualizações</span>
                  <span className="font-medium">{vaga.visualizacoes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Sobre a empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">{vaga.empresa.nome}</p>
              {vaga.empresa.descricao && (
                <p className="text-muted-foreground line-clamp-4">{vaga.empresa.descricao}</p>
              )}
              {vaga.empresa.site && (
                <a
                  href={vaga.empresa.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {vaga.empresa.site.replace(/^https?:\/\//, "")}
                </a>
              )}
              <Link href={`/empresas/${vaga.empresa.slug}`} className="text-primary hover:underline block">
                Ver todas as vagas da empresa →
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
