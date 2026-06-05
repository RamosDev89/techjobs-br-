import axios from "axios";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";

interface GupyJob {
  id: number;
  name: string;
  description: string;
  workplaceType: string;
  city?: string;
  state?: string;
  jobUrl: string;
  publishedDate: string;
  careerPageName: string;
  careerPageUrl?: string;
}

function mapWorkplace(type: string): ScrapedVaga["modalidade"] {
  switch (type?.toLowerCase()) {
    case "remote": return "REMOTA";
    case "hybrid": return "HIBRIDA";
    default: return "PRESENCIAL";
  }
}

function guessCargo(title: string): ScrapedVaga["cargo"] {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("front-end")) return "FRONTEND";
  if (t.includes("backend") || t.includes("back-end")) return "BACKEND";
  if (t.includes("fullstack") || t.includes("full stack")) return "FULLSTACK";
  if (t.includes("mobile") || t.includes("ios") || t.includes("android")) return "MOBILE";
  if (t.includes("devops") || t.includes("cloud") || t.includes("sre")) return "DEVOPS";
  if (t.includes("data") || t.includes("analytics") || t.includes("machine learning")) return "DATA";
  if (t.includes("qa") || t.includes("test") || t.includes("qualidade")) return "QA";
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) return "DESIGN";
  if (t.includes("product") || t.includes("produto")) return "PRODUTO";
  if (t.includes("security") || t.includes("segurança")) return "SEGURANCA";
  if (t.includes("ia") || t.includes("ai ") || t.includes("inteligência artificial")) return "IA";
  return "OUTRO";
}

function guessNivel(title: string): ScrapedVaga["nivel"] {
  const t = title.toLowerCase();
  if (t.includes("estágio") || t.includes("estagio") || t.includes("intern")) return "ESTAGIO";
  if (t.includes("júnior") || t.includes("junior") || t.includes("jr")) return "JUNIOR";
  if (t.includes("pleno") || t.includes("mid")) return "PLENO";
  if (t.includes("sênior") || t.includes("senior") || t.includes("sr")) return "SENIOR";
  if (t.includes("especialista") || t.includes("specialist")) return "ESPECIALISTA";
  if (t.includes("gerente") || t.includes("manager") || t.includes("lead")) return "GERENCIA";
  return "PLENO";
}

function extractTechs(text: string): string[] {
  const known = [
    "React", "Vue", "Angular", "Next.js", "Nuxt", "TypeScript", "JavaScript",
    "Python", "Java", "Go", "Golang", "Rust", "C#", ".NET", "Node.js",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL",
    "MongoDB", "Redis", "GraphQL", "REST", "Kotlin", "Swift", "Flutter",
    "React Native", "Terraform", "Linux", "Spring", "Django", "FastAPI",
  ];
  return known.filter((t) => text.includes(t));
}

export async function scrapeGupy(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 50 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  const searches = ["desenvolvedor", "engenheiro software", "programador", "developer"];

  try {
    for (const kw of searches) {
      if (vagas.length >= maxResults) break;
      const url = `https://portal.api.gupy.io/api/job?name=${encodeURIComponent(kw)}&limit=20`;
      const res = await axios.get<{ data: GupyJob[] }>(url, {
        timeout: 15_000,
        headers: { "User-Agent": "TechJobsBR/1.0 (+https://techjobsbr.com.br)" },
      });

      for (const job of res.data?.data ?? []) {
        if (vagas.length >= maxResults) break;
        vagas.push({
          titulo: job.name,
          descricao: job.description ?? "",
          empresaNome: job.careerPageName,
          empresaSite: job.careerPageUrl,
          publicadaEm: job.publishedDate ? new Date(job.publishedDate) : undefined,
          modalidade: mapWorkplace(job.workplaceType),
          nivel: guessNivel(job.name),
          cargo: guessCargo(job.name),
          tipoContrato: "CLT",
          estado: job.state,
          cidade: job.city,
          tecnologias: extractTechs(job.description ?? ""),
          fonteExterna: job.jobUrl,
          nomeFonte: "Gupy",
        });
      }
    }
  } catch (err) {
    errors.push(`Gupy: ${(err as Error).message}`);
  }

  return { source: "Gupy", vagas, errors };
}
