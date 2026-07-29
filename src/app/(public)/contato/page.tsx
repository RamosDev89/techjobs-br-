import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Linkedin, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 86400;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  title: "Contato | TechJobs BR",
  description: "Entre em contato com o TechJobs BR para dúvidas, sugestões ou parcerias.",
  alternates: { canonical: `${APP_URL}/contato` },
};

export default function ContatoPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Contato</h1>
      <p className="text-muted-foreground mb-8">
        Dúvidas, sugestões, reporte de vagas incorretas ou interesse em anunciar — fale comigo.
      </p>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Email</p>
              <a
                href="mailto:contato@techjobsbr.com.br"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                contato@techjobsbr.com.br
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Linkedin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">LinkedIn</p>
              <a
                href="https://www.linkedin.com/in/fernandorramos/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Fernando Rafael Ramos
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Anunciar vaga</p>
              <p className="text-sm text-muted-foreground">Destaque sua empresa para milhares de devs</p>
            </div>
            <Button size="sm" asChild>
              <Link href="/anuncie">Ver planos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Respondo em até 48 horas úteis.
      </p>
    </div>
  );
}
