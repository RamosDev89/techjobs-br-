import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmacaoCandidaturaProps {
  candidatoNome: string;
  vagaTitulo: string;
  empresaNome: string;
  vagaSlug: string;
  appUrl: string;
}

export function ConfirmacaoCandidaturaEmail({
  candidatoNome,
  vagaTitulo,
  empresaNome,
  vagaSlug,
  appUrl,
}: ConfirmacaoCandidaturaProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>
        Candidatura enviada: {vagaTitulo} em {empresaNome}
      </Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ color: "#111827", fontSize: "24px" }}>
            ✅ Candidatura enviada!
          </Heading>

          <Text style={{ color: "#374151" }}>
            Olá {candidatoNome},
          </Text>

          <Text style={{ color: "#374151" }}>
            Sua candidatura para a vaga foi enviada com sucesso.
          </Text>

          <Section style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", margin: "16px 0" }}>
            <Text style={{ fontWeight: "bold", color: "#111827", margin: "0 0 4px" }}>
              {vagaTitulo}
            </Text>
            <Text style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
              {empresaNome}
            </Text>
          </Section>

          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            Você pode acompanhar o status da sua candidatura no{" "}
            <Link href={`${appUrl}/dashboard/candidaturas`} style={{ color: "#3b82f6" }}>
              seu painel
            </Link>.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb" }} />

          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            TechJobs BR ·{" "}
            <Link href={`${appUrl}/vagas/${vagaSlug}`} style={{ color: "#3b82f6" }}>
              Ver vaga
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ConfirmacaoCandidaturaEmail;
