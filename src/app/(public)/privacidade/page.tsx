import type { Metadata } from "next";

export const revalidate = 86400;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  title: "Política de Privacidade | TechJobs BR",
  description: "Política de privacidade do TechJobs BR.",
  alternates: { canonical: `${APP_URL}/privacidade` },
};

export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: julho de 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Dados coletados</h2>
          <p>
            Coletamos apenas os dados necessários para o funcionamento da plataforma: endereço de
            email (para criação de conta e alertas de vagas), dados de acesso via Google (quando
            utilizado login social) e informações de candidatura preenchidas voluntariamente.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Uso dos dados</h2>
          <p>Seus dados são usados exclusivamente para:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Autenticação e acesso à conta</li>
            <li>Envio de alertas de vagas configurados por você</li>
            <li>Registro de candidaturas realizadas pela plataforma</li>
          </ul>
          <p className="mt-2">Não vendemos nem compartilhamos seus dados com terceiros.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Cookies</h2>
          <p>
            Utilizamos cookies de sessão para autenticação (Supabase Auth). Não utilizamos cookies
            de rastreamento ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Vagas de terceiros</h2>
          <p>
            As vagas exibidas são agregadas de plataformas externas (Gupy, Indeed, Programathor,
            GeekHunter). Ao clicar em uma vaga, você é redirecionado ao site de origem. A política
            de privacidade de cada plataforma de origem se aplica nesses casos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Seus direitos (LGPD)</h2>
          <p>
            Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a
            acessar, corrigir ou excluir seus dados. Para exercer esses direitos, entre em contato
            pelo email <a href="mailto:contato@techjobsbr.com.br" className="text-foreground underline underline-offset-4">contato@techjobsbr.com.br</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Contato</h2>
          <p>
            Dúvidas sobre esta política:{" "}
            <a href="mailto:contato@techjobsbr.com.br" className="text-foreground underline underline-offset-4">
              contato@techjobsbr.com.br
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
