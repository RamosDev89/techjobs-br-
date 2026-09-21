import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Zap, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { VagaCard } from "@/components/vagas/VagaCard";
import { LandingLinks } from "@/components/seo/LandingLinks";
import type { VagaComEmpresa } from "@/types";
import { SLUG_BY_TECH } from "@/lib/seo-landings";

export const revalidate = 300; // 5 min

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  alternates: { canonical: APP_URL },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TechJobs BR",
  url: APP_URL,
  description:
    "Encontre as melhores vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/vagas?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

async function getStats() {
  const [totalVagas, totalEmpresas, totalRemoto] = await Promise.all([
    prisma.vaga.count({ where: { ativa: true } }),
    prisma.empresa.count(),
    prisma.vaga.count({ where: { ativa: true, modalidade: { in: ["REMOTA", "REMOTA_INTERNACIONAL"] } } }),
  ]);
  return { totalVagas, totalEmpresas, totalRemoto };
}

async function getDestacadas(): Promise<VagaComEmpresa[]> {
  return prisma.vaga.findMany({
    where: { ativa: true, destacada: true },
    include: {
      empresa: {
        select: { id: true, nome: true, slug: true, logo: true, tamanho: true, localizacao: true, verificada: true },
      },
    },
    orderBy: [{ destacada: "desc" }, { criadaEm: "desc" }],
    take: 6,
  }) as Promise<VagaComEmpresa[]>;
}

async function getRecentes(): Promise<VagaComEmpresa[]> {
  return prisma.vaga.findMany({
    where: { ativa: true },
    include: {
      empresa: {
        select: { id: true, nome: true, slug: true, logo: true, tamanho: true, localizacao: true, verificada: true },
      },
    },
    orderBy: { criadaEm: "desc" },
    take: 8,
  }) as Promise<VagaComEmpresa[]>;
}

const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "React",       href: `/vagas/${SLUG_BY_TECH["React"]}` },
  { label: "Node.js",     href: `/vagas/${SLUG_BY_TECH["Node.js"]}` },
  { label: "Python",      href: `/vagas/${SLUG_BY_TECH["Python"]}` },
  { label: "TypeScript",  href: `/vagas/${SLUG_BY_TECH["TypeScript"]}` },
  { label: "Java",        href: `/vagas/${SLUG_BY_TECH["Java"]}` },
  { label: "Remota",      href: "/vagas?modalidade=REMOTA" },
  { label: "AWS",         href: `/vagas/${SLUG_BY_TECH["AWS"]}` },
  { label: "Kubernetes",  href: `/vagas/${SLUG_BY_TECH["Kubernetes"]}` },
];

const CARGOS = [
  { label: "Frontend",  value: "FRONTEND",  emoji: "🖥️" },
  { label: "Backend",   value: "BACKEND",   emoji: "⚙️" },
  { label: "Fullstack", value: "FULLSTACK", emoji: "🔄" },
  { label: "Mobile",    value: "MOBILE",    emoji: "📱" },
  { label: "DevOps",    value: "DEVOPS",    emoji: "🚀" },
  { label: "Dados",     value: "DATA",      emoji: "📊" },
  { label: "Design",    value: "DESIGN",    emoji: "🎨" },
  { label: "IA/ML",     value: "IA",        emoji: "🤖" },
];

export default async function HomePage() {
  const [stats, destacadas, recentes] = await Promise.all([
    getStats(),
    getDestacadas(),
    getRecentes(),
  ]);

  const vagasHero = destacadas.length > 0 ? destacadas : recentes;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/60 to-background border-b py-16 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white dark:bg-card border rounded-full px-3 py-1.5 mb-6 shadow-sm">
                <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full tracking-wide">🇧🇷 NOVO</span>
                <span className="text-sm font-semibold text-muted-foreground">Vagas de tech no Brasil — atualizado a cada 3h</span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-5">
                Encontre sua<br />próxima vaga<br />
                <span className="relative inline-block text-primary">
                  em tech
                  <span className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-primary to-orange-400" />
                </span>
              </h1>

              <p className="text-muted-foreground text-lg max-w-xl mb-8 leading-relaxed">
                Agregamos vagas de <strong className="text-foreground font-bold">Gupy</strong>,{" "}
                <strong className="text-foreground font-bold">Indeed</strong>,{" "}
                <strong className="text-foreground font-bold">Programathor</strong> e{" "}
                <strong className="text-foreground font-bold">GeekHunter</strong>. Mais de{" "}
                <strong className="text-foreground font-bold">{stats.totalVagas.toLocaleString("pt-BR")}</strong> vagas
                ativas de <strong className="text-foreground font-bold">{stats.totalEmpresas}</strong> empresas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button size="lg" variant="orange" asChild>
                  <Link href="/vagas">
                    <Search className="h-5 w-5" />
                    Buscar vagas
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/anuncie">
                    Publicar vaga
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">Popular:</span>
                {POPULAR_SEARCHES.map((s) => (
                  <Link key={s.href} href={s.href}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary hover:text-primary hover:border-primary/30 transition-all rounded-full font-semibold"
                    >
                      {s.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — stat cards */}
            <div className="hidden md:flex flex-col gap-3">
              <div className="bg-card rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">💼</div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-black text-primary tracking-tight leading-none">
                    {stats.totalVagas.toLocaleString("pt-BR")}+
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Vagas ativas agora</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 live-dot" />
              </div>

              <div className="bg-card rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-2xl shrink-0">🏢</div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-black text-orange-500 tracking-tight leading-none">
                    {stats.totalEmpresas.toLocaleString("pt-BR")}+
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Empresas cadastradas</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-2xl shrink-0">🌎</div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-black text-green-600 dark:text-green-400 tracking-tight leading-none">
                    {stats.totalRemoto.toLocaleString("pt-BR")}+
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Vagas 100% remotas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cargos */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight">Explorar por área</h2>
            <Link href="/vagas" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CARGOS.map((cargo) => (
              <Link key={cargo.value} href={`/vagas?cargo=${cargo.value}`}>
                <Card className="hover:border-primary/40 hover:bg-secondary/60 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                      {cargo.emoji}
                    </div>
                    <p className="font-extrabold text-sm">{cargo.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vagas em destaque / recentes */}
      {vagasHero.length > 0 && (
        <section className="py-14 bg-secondary/30 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                {destacadas.length > 0 ? "Vagas em destaque ✨" : "Vagas recentes"}
              </h2>
              <Link href="/vagas" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {vagasHero.map((vaga) => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Landing links — crawl path + SEO */}
      <LandingLinks />

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black tracking-tight text-center mb-10">Por que usar o TechJobs BR? 🚀</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-200 dark:from-primary/20 dark:to-violet-900/40 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-extrabold mb-2">Agregação automática</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vagas de Gupy, Indeed, Programathor e GeekHunter atualizadas a cada 3 horas. Sempre fresquinhas.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-extrabold mb-2">Filtros avançados</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Filtre por cargo, modalidade, nível, contrato, salário e tecnologia. Ache exatamente o que você quer.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-extrabold mb-2">Alertas por email</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure alertas e receba novas vagas no email a cada 6 horas. Não perca nenhuma oportunidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
