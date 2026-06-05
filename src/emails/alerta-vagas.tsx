import {
  Body,
  Button,
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

interface VagaItem {
  titulo: string;
  empresa: string;
  modalidade: string;
  nivel: string;
  slug: string;
}

interface AlertaVagasEmailProps {
  vagas: VagaItem[];
  appUrl: string;
}

export function AlertaVagasEmail({ vagas, appUrl }: AlertaVagasEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>
        {`${vagas.length} nova${vagas.length > 1 ? "s" : ""} vaga${vagas.length > 1 ? "s" : ""} para você no TechJobs BR`}
      </Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ color: "#111827", fontSize: "24px" }}>
            🔔 Novas vagas para você!
          </Heading>

          <Text style={{ color: "#6b7280" }}>
            Encontramos {vagas.length} nova{vagas.length > 1 ? "s" : ""} vaga{vagas.length > 1 ? "s" : ""} que correspondem ao seu alerta.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb" }} />

          {vagas.map((vaga) => (
            <Section key={vaga.slug} style={{ marginBottom: "16px", padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <Text style={{ fontWeight: "bold", color: "#111827", margin: "0 0 4px" }}>
                {vaga.titulo}
              </Text>
              <Text style={{ color: "#6b7280", margin: "0 0 8px", fontSize: "14px" }}>
                {vaga.empresa} · {vaga.modalidade} · {vaga.nivel}
              </Text>
              <Link href={`${appUrl}/vagas/${vaga.slug}`} style={{ color: "#3b82f6", fontSize: "14px" }}>
                Ver vaga →
              </Link>
            </Section>
          ))}

          <Hr style={{ borderColor: "#e5e7eb" }} />

          <Button
            href={`${appUrl}/vagas`}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Ver todas as vagas
          </Button>

          <Text style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}>
            Você está recebendo este email porque configurou um alerta no{" "}
            <Link href={appUrl} style={{ color: "#3b82f6" }}>TechJobs BR</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AlertaVagasEmail;
