import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { formatSalary } from "@/lib/utils";

export const runtime = "nodejs";
export const revalidate = 3600;

export const alt = "Vaga de tecnologia no TechJobs BR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const modalidadeLabel: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDA: "Híbrida",
  REMOTA: "Remota",
  REMOTA_INTERNACIONAL: "Remota Internacional",
};

const nivelLabel: Record<string, string> = {
  ESTAGIO: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  GERENCIA: "Gerência",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vaga = await prisma.vaga.findUnique({
    where: { slug, ativa: true },
    include: { empresa: true },
  });

  const titulo = vaga?.titulo ?? "Vaga de tecnologia";
  const empresa = vaga?.empresa.nome ?? "TechJobs BR";
  const salario = vaga ? formatSalary(vaga.salarioMin, vaga.salarioMax, vaga.moeda) : "";
  const tags = vaga
    ? [modalidadeLabel[vaga.modalidade], nivelLabel[vaga.nivel]].filter(Boolean)
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  background: "#1d4ed8",
                  fontSize: "26px",
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titulo.length > 60 ? "52px" : "64px",
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {titulo}
          </div>
          <div style={{ display: "flex", fontSize: "36px", color: "#94a3b8" }}>
            {empresa}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: "32px", color: "#4ade80", fontWeight: 600 }}>
            {salario}
          </div>
          <div style={{ display: "flex", fontSize: "32px", fontWeight: 700 }}>
            TechJobs <span style={{ color: "#3b82f6" }}>BR</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
