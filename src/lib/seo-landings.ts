import { slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

// Techs canônicas exatas — same list as src/scraper/utils.ts extractTechs
const TECHS = [
  "React", "Vue", "Angular", "Next.js", "Nuxt", "TypeScript", "JavaScript",
  "Python", "Java", "Go", "Golang", "Rust", "C#", ".NET", "Node.js",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL",
  "MongoDB", "Redis", "GraphQL", "REST", "Kotlin", "Swift", "Flutter",
  "React Native", "Terraform", "Linux", "Spring", "Django", "FastAPI",
  "Laravel", "PHP", "Ruby", "Rails", "Scala", "Elixir", "Clojure",
  "Prisma", "Supabase", "Firebase", "Tailwind", "SASS", "Webpack",
  "Vite", "Jest", "Cypress", "Playwright",
] as const;

// slugify() drops non-alphanumeric; C# → "c", .NET → "net" (ruim). Override manual.
const SLUG_OVERRIDES: Partial<Record<string, string>> = {
  "C#": "csharp",
  ".NET": "dotnet",
};

// "React Native" → "react-native" (slugify handles spaces + lowercasing)
export const TECH_BY_SLUG: Record<string, string> = Object.fromEntries(
  TECHS.map((t) => [SLUG_OVERRIDES[t] ?? slugify(t), t])
);

export const SLUG_BY_TECH: Record<string, string> = Object.fromEntries(
  TECHS.map((t) => [t, SLUG_OVERRIDES[t] ?? slugify(t)])
);

export interface LandingCity {
  slug: string;
  nome: string;
  uf: string;
  // matchers: variantes lowercase (com e sem acento) do nome da cidade — scrapers são inconsistentes
  matchers: string[];
}

export const LANDING_CITIES: LandingCity[] = [
  { slug: "sao-paulo",       nome: "São Paulo",      uf: "SP", matchers: ["são paulo", "sao paulo"] },
  { slug: "rio-de-janeiro",  nome: "Rio de Janeiro", uf: "RJ", matchers: ["rio de janeiro"] },
  { slug: "belo-horizonte",  nome: "Belo Horizonte", uf: "MG", matchers: ["belo horizonte"] },
  { slug: "curitiba",        nome: "Curitiba",       uf: "PR", matchers: ["curitiba"] },
  { slug: "porto-alegre",    nome: "Porto Alegre",   uf: "RS", matchers: ["porto alegre"] },
  { slug: "florianopolis",   nome: "Florianópolis",  uf: "SC", matchers: ["florianópolis", "florianopolis"] },
  { slug: "campinas",        nome: "Campinas",       uf: "SP", matchers: ["campinas"] },
  { slug: "recife",          nome: "Recife",         uf: "PE", matchers: ["recife"] },
  { slug: "fortaleza",       nome: "Fortaleza",      uf: "CE", matchers: ["fortaleza"] },
  { slug: "brasilia",        nome: "Brasília",       uf: "DF", matchers: ["brasília", "brasilia"] },
  { slug: "salvador",        nome: "Salvador",       uf: "BA", matchers: ["salvador"] },
  { slug: "joinville",       nome: "Joinville",      uf: "SC", matchers: ["joinville"] },
];

// Mapa slug-cidade pra lookup rápido
const CITY_BY_SLUG: Record<string, LandingCity> = Object.fromEntries(
  LANDING_CITIES.map((c) => [c.slug, c])
);

export interface LandingParams {
  tech: string;      // canônico, ex. "React Native"
  techSlug: string;  // ex. "react-native"
  remoto?: true;
  cidade?: LandingCity;
}

// Número mínimo de vagas pra indexar a landing (e incluir no sitemap).
// Com <3: renderiza mas robots noindex. Com 0: empty state, não 404.
export const LANDING_INDEX_THRESHOLD = 3;

/**
 * Parseia um slug URL pra landing params, ou retorna null se não for landing.
 * Estratégia strip-sufixo: "react-native-sao-paulo" → strip "-sao-paulo" → "react-native" (tech exata) ✓
 * "react-remoto" → strip "-remoto" → "react" (tech exata) ✓
 * "react-native" → match exato como tech ✓ (nunca interpretado como react+cidade "native")
 */
export function parseLandingSlug(slug: string): LandingParams | null {
  // 1. match exato de tech
  if (TECH_BY_SLUG[slug]) {
    return { tech: TECH_BY_SLUG[slug], techSlug: slug };
  }

  // 2. tech-remoto
  if (slug.endsWith("-remoto")) {
    const ts = slug.slice(0, -"-remoto".length);
    if (TECH_BY_SLUG[ts]) {
      return { tech: TECH_BY_SLUG[ts], techSlug: ts, remoto: true };
    }
  }

  // 3. tech-cidade (multi-hyphen cities handled: "react-sao-paulo", "python-rio-de-janeiro")
  for (const cidade of LANDING_CITIES) {
    const suffix = `-${cidade.slug}`;
    if (slug.endsWith(suffix)) {
      const ts = slug.slice(0, -suffix.length);
      if (TECH_BY_SLUG[ts]) {
        return { tech: TECH_BY_SLUG[ts], techSlug: ts, cidade };
      }
    }
  }

  return null;
}

export function landingSlug(p: LandingParams): string {
  if (p.remoto) return `${p.techSlug}-remoto`;
  if (p.cidade) return `${p.techSlug}-${p.cidade.slug}`;
  return p.techSlug;
}

export function landingTitle(p: LandingParams): string {
  if (p.remoto) return `Vagas de ${p.tech} Remotas`;
  if (p.cidade) return `Vagas de ${p.tech} em ${p.cidade.nome}`;
  return `Vagas de ${p.tech}`;
}

const REMOTE_MODALIDADES = ["REMOTA", "REMOTA_INTERNACIONAL"] as const;

export function landingWhere(p: LandingParams): Prisma.VagaWhereInput {
  return {
    ativa: true,
    tecnologias: { has: p.tech },
    ...(p.remoto && {
      modalidade: { in: [...REMOTE_MODALIDADES] },
    }),
    ...(p.cidade && {
      OR: p.cidade.matchers.map((m) => ({
        cidade: { contains: m, mode: "insensitive" as const },
      })),
    }),
  };
}

// Checa se uma vaga (linha JS do sitemap) bate em determinada landing — espelha landingWhere.
export function vagaMatchesLanding(
  v: { tecnologias: string[]; cidade: string | null; modalidade: string },
  p: LandingParams
): boolean {
  if (!v.tecnologias.includes(p.tech)) return false;
  if (p.remoto && !(REMOTE_MODALIDADES as readonly string[]).includes(v.modalidade)) return false;
  if (p.cidade) {
    const cidadeLower = (v.cidade ?? "").toLowerCase();
    if (!p.cidade.matchers.some((m) => cidadeLower.includes(m))) return false;
  }
  return true;
}

export { CITY_BY_SLUG };
