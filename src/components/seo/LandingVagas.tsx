import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VagaGrid } from "@/components/vagas/VagaGrid";
import { Badge } from "@/components/ui/badge";
import {
  LandingParams,
  LANDING_CITIES,
  TECH_BY_SLUG,
  landingTitle,
  landingWhere,
  landingSlug,
  LANDING_INDEX_THRESHOLD,
} from "@/lib/seo-landings";
import type { VagaComEmpresa } from "@/types";

// Top 4 cidades pra cross-links (as mais populosas em tech BR)
const TOP_CITY_SLUGS = ["sao-paulo", "rio-de-janeiro", "belo-horizonte", "curitiba"];

function buildListingUrl(p: LandingParams): string {
  const params = new URLSearchParams({ q: p.tech });
  if (p.remoto) params.set("modalidade", "REMOTA");
  if (p.cidade) params.set("cidade", p.cidade.nome);
  return `/vagas?${params.toString()}`;
}

function buildIntro(p: LandingParams, total: number): string {
  if (total === 0) {
    return `Não encontramos vagas de ${p.tech}${p.remoto ? " remotas" : p.cidade ? ` em ${p.cidade.nome}` : ""} no momento. Confira as vagas de ${p.tech} em geral ou ative um alerta.`;
  }
  if (p.remoto) {
    return `${total} vaga${total !== 1 ? "s" : ""} de ${p.tech} em regime remoto no Brasil. Trabalhe de qualquer lugar com empresas que buscam profissionais de ${p.tech} para posições 100% remotas e remotas internacionais.`;
  }
  if (p.cidade) {
    return `${total} vaga${total !== 1 ? "s" : ""} de ${p.tech} em ${p.cidade.nome}, ${p.cidade.uf}. Empresas da região e de todo o Brasil contratando desenvolvedores de ${p.tech} ${p.cidade.nome === "São Paulo" || p.cidade.nome === "Campinas" ? "no interior e na capital paulista" : `em ${p.cidade.nome}`}.`;
  }
  return `${total} vaga${total !== 1 ? "s" : ""} de ${p.tech} no Brasil. Vagas presenciais, híbridas e remotas com empresas que buscam profissionais de ${p.tech} em todo o país. Salários, benefícios e candidatura direta.`;
}

function RelatedLinks({ p }: { p: LandingParams }) {
  const links: { href: string; label: string }[] = [];

  if (p.remoto || p.cidade) {
    // Sempre tem link pro tech geral
    links.push({ href: `/vagas/${p.techSlug}`, label: `Todas vagas de ${p.tech}` });
  }

  if (!p.remoto) {
    links.push({ href: `/vagas/${p.techSlug}-remoto`, label: `${p.tech} Remote` });
  }

  if (!p.cidade) {
    // Tech-only ou remoto: oferecer top cidades
    for (const cs of TOP_CITY_SLUGS) {
      const city = LANDING_CITIES.find((c) => c.slug === cs);
      if (city) links.push({ href: `/vagas/${p.techSlug}-${cs}`, label: `${p.tech} em ${city.nome}` });
    }
  } else {
    // Cidade: oferecer outras cidades + remoto
    for (const cs of TOP_CITY_SLUGS) {
      if (cs === p.cidade!.slug) continue;
      const city = LANDING_CITIES.find((c) => c.slug === cs);
      if (city) links.push({ href: `/vagas/${p.techSlug}-${cs}`, label: `${p.tech} em ${city.nome}` });
    }
  }

  if (links.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-sm font-medium text-muted-foreground mb-3">Vagas relacionadas</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
              {l.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function LandingVagas({ landing }: { landing: LandingParams }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";
  const where = landingWhere(landing);

  const [vagas, total] = await Promise.all([
    prisma.vaga.findMany({
      where,
      include: { empresa: true },
      orderBy: [{ destacada: "desc" }, { criadaEm: "desc" }],
      take: 30,
    }),
    prisma.vaga.count({ where }),
  ]);

  const title = landingTitle(landing);
  const slug = landingSlug(landing);
  const listingUrl = buildListingUrl(landing);
  const isIndexed = total >= LANDING_INDEX_THRESHOLD;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Vagas", item: `${baseUrl}/vagas` },
      { "@type": "ListItem", position: 3, name: title, item: `${baseUrl}/vagas/${slug}` },
    ],
  };

  const itemListSchema =
    vagas.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: title,
          url: `${baseUrl}/vagas/${slug}`,
          numberOfItems: total,
          itemListElement: vagas.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${baseUrl}/vagas/${v.slug}`,
            name: v.titulo,
          })),
        }
      : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <div className="mb-6">
        <Link
          href="/vagas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar às vagas
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          {buildIntro(landing, total)}
        </p>
        {!isIndexed && total > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Poucas vagas encontradas para este filtro.{" "}
            <Link href={listingUrl} className="underline underline-offset-2">
              Ver busca completa
            </Link>
          </p>
        )}
      </div>

      <VagaGrid vagas={vagas as VagaComEmpresa[]} />

      {total > 30 && (
        <div className="mt-8 text-center">
          <Link
            href={listingUrl}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Ver todas as {total} vagas de {landing.tech}
            {landing.remoto ? " remotas" : landing.cidade ? ` em ${landing.cidade.nome}` : ""} →
          </Link>
        </div>
      )}

      <RelatedLinks p={landing} />
    </div>
  );
}
