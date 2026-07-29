import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Code2, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 86400;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  title: "Sobre o TechJobs BR",
  description:
    "TechJobs BR é um agregador de vagas de tecnologia no Brasil. Reunimos vagas de Gupy, Indeed, Programathor e GeekHunter em um só lugar.",
  alternates: { canonical: `${APP_URL}/sobre` },
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Sobre o TechJobs BR</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-foreground text-lg">
          TechJobs BR é um agregador de vagas de tecnologia criado para facilitar a busca de
          oportunidades para profissionais de tech no Brasil.
        </p>

        <p>
          Buscamos vagas automaticamente a cada 3 horas nas principais plataformas —{" "}
          <strong className="text-foreground">Gupy, Indeed, Programathor e GeekHunter</strong> —
          e reunimos tudo em um único lugar com filtros avançados por cargo, modalidade, nível,
          tecnologia e salário.
        </p>

        <div className="grid gap-4 py-4">
          {[
            {
              icon: Search,
              title: "Busca centralizada",
              desc: "Uma plataforma, várias fontes. Sem precisar visitar cada site separado.",
            },
            {
              icon: Bell,
              title: "Alertas por email",
              desc: "Configure filtros e receba novas vagas compatíveis diretamente no seu email.",
            },
            {
              icon: Code2,
              title: "Foco em tech",
              desc: "Filtramos apenas vagas da área de tecnologia: dev, dados, design, produto, DevOps e mais.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-4 border rounded-lg">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{item.title}</p>
                <p className="text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p>
          O projeto é desenvolvido e mantido por{" "}
          <a
            href="https://www.linkedin.com/in/fernandorramos/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary"
          >
            Fernando Rafael Ramos
          </a>
          , desenvolvedor fullstack apaixonado por criar ferramentas úteis para a comunidade tech
          brasileira.
        </p>

        <p>
          Dúvidas, sugestões ou quer anunciar sua vaga?{" "}
          <Link href="/contato" className="text-foreground font-medium underline underline-offset-4 hover:text-primary">
            Entre em contato
          </Link>
          .
        </p>
      </div>

      <div className="flex gap-3 mt-10">
        <Button asChild>
          <Link href="/vagas">Buscar vagas</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/anuncie">Anunciar vaga</Link>
        </Button>
      </div>
    </div>
  );
}
