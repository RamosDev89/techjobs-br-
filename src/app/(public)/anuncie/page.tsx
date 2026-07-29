import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Star, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  title: "Publique sua vaga de tecnologia no Brasil",
  description:
    "Contrate os melhores desenvolvedores do Brasil. Publique uma vaga destacada no TechJobs BR por R$297 e alcance milhares de profissionais de tecnologia.",
  alternates: { canonical: `${APP_URL}/anuncie` },
  openGraph: {
    title: "Anuncie no TechJobs BR | Vagas de Tech no Brasil",
    description: "Publique vaga destacada por R$297/30 dias. Visibilidade máxima para desenvolvedores frontend, backend, fullstack, mobile, DevOps e mais.",
  },
};

const BENEFICIOS = [
  { icon: Star, text: "Destaque na listagem de vagas — aparece sempre primeiro" },
  { icon: TrendingUp, text: "Exibição na homepage para todos os visitantes" },
  { icon: Zap, text: "Indexada nas páginas de busca por tecnologia (React, Python, AWS...)" },
  { icon: Users, text: "Alcance candidatos ativos e passivos em todo o Brasil" },
  { icon: CheckCircle2, text: "30 dias de exibição garantida com renovação fácil" },
  { icon: CheckCircle2, text: "Aparece nos alertas de email dos candidatos cadastrados" },
];

export default function AnunciePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            🇧🇷 Para empresas
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Contrate os melhores
            <span className="text-primary block">devs do Brasil</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8">
            Publique uma vaga destacada no TechJobs BR e alcance milhares de profissionais de tecnologia
            ativos e passivos em todo o país.
          </p>
          <Button size="lg" asChild>
            <Link href="/anuncie/publicar">
              Publicar vaga agora — R$297
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">30 dias de destaque · Ativação imediata após pagamento</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">Simples e transparente</h2>
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-primary shadow-lg">
              <CardHeader className="text-center pb-4">
                <Badge className="mx-auto mb-3 w-fit">Vaga Destaque</Badge>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-muted-foreground text-lg">R$</span>
                  <span className="text-5xl font-bold">297</span>
                  <span className="text-muted-foreground">/30 dias</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {BENEFICIOS.map((b) => (
                    <li key={b.text} className="flex items-start gap-3 text-sm">
                      <b.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4" size="lg" asChild>
                  <Link href="/anuncie/publicar">Publicar minha vaga</Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Pagamento via PIX, cartão de crédito ou boleto (Mercado Pago)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ mínimo */}
      <section className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-6 text-center">Dúvidas frequentes</h2>
          <div className="space-y-4 text-sm">
            {[
              ["Como funciona o destaque?", "Vagas destacadas aparecem sempre no topo da listagem e na seção principal da homepage, antes das vagas gratuitas."],
              ["Quando a vaga é publicada?", "Imediatamente após a confirmação do pagamento. O processo leva segundos."],
              ["Por quanto tempo fica no ar?", "30 dias corridos a partir da publicação. Após esse prazo, você pode renovar."],
              ["Quais formas de pagamento?", "PIX, cartão de crédito (até 12x) e boleto bancário via Mercado Pago."],
              ["Posso editar a vaga depois?", "Sim, entre em contato pelo email de suporte e faço a edição pra você."],
            ].map(([q, a]) => (
              <div key={q} className="border rounded-lg p-4">
                <p className="font-medium mb-1">{q}</p>
                <p className="text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/anuncie/publicar">Começar agora</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
