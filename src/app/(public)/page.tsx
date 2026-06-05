import Link from "next/link";
import { ArrowRight, Search, Zap, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { VagaCard } from "@/components/vagas/VagaCard";
import type { VagaComEmpresa } from "@/types";

export const revalidate = 1800; // 30 min

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
    orderBy: { criadaEm: "desc" },
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

const POPULAR_SEARCHES = [
  "React", "Node.js", "Python", "TypeScript", "Java", "Remota", "AWS", "Kubernetes",
];

const CARGOS = [
  { label: "Frontend", value: "FRONTEND", emoji: "🖥️" },
  { label: "Backend", value: "BACKEND", emoji: "⚙️" },
  { label: "Fullstack", value: "FULLSTACK", emoji: "🔄" },
  { label: "Mobile", value: "MOBILE", emoji: "📱" },
  { label: "DevOps", value: "DEVOPS", emoji: "🚀" },
  { label: "Dados", value: "DATA", emoji: "📊" },
  { label: "Design", value: "DESIGN", emoji: "🎨" },
  { label: "IA/ML", value: "IA", emoji: "🤖" },
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
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            🇧🇷 Vagas de tech no Brasil
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Encontre sua próxima
            <span className="text-primary block">vaga em tech</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Agregamos vagas de Gupy, Indeed, Programathor e GeekHunter. Mais de{" "}
            <strong>{stats.totalVagas.toLocaleString("pt-BR")}</strong> vagas ativas de{" "}
            <strong>{stats.totalEmpresas}</strong> empresas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button size="lg" asChild>
              <Link href="/vagas">
                <Search className="h-5 w-5" />
                Buscar vagas
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/para-empresas">
                Publicar vaga
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {POPULAR_SEARCHES.map((term) => (
              <Link key={term} href={`/vagas?q=${encodeURIComponent(term)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  {term}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">
                {stats.totalVagas.toLocaleString("pt-BR")}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">Vagas ativas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                {stats.totalEmpresas.toLocaleString("pt-BR")}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">Empresas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                {stats.totalRemoto.toLocaleString("pt-BR")}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">Vagas remotas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cargos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Buscar por área</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CARGOS.map((cargo) => (
              <Link key={cargo.value} href={`/vagas?cargo=${cargo.value}`}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{cargo.emoji}</div>
                    <p className="font-medium text-sm">{cargo.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vagas em destaque / recentes */}
      {vagasHero.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {destacadas.length > 0 ? "Vagas em destaque" : "Vagas recentes"}
              </h2>
              <Link href="/vagas" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {vagasHero.map((vaga) => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Por que usar o TechJobs BR?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Agregação automática</h3>
                <p className="text-sm text-muted-foreground">
                  Vagas de Gupy, Indeed, Programathor e GeekHunter atualizadas a cada 3 horas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Filtros avançados</h3>
                <p className="text-sm text-muted-foreground">
                  Filtre por cargo, modalidade, nível, contrato, salário e tecnologia.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Alertas por email</h3>
                <p className="text-sm text-muted-foreground">
                  Configure alertas e receba novas vagas por email a cada 6 horas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
