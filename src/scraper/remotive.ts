import axios from "axios";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  description: string;
  company_url?: string;
}

const CATEGORIES = [
  "software-dev",
  "devops-sysadmin",
  "data",
  "design",
  "qa",
  "product",
];

function mapJobType(type: string): ScrapedVaga["tipoContrato"] {
  const t = (type ?? "").toLowerCase();
  if (t.includes("contract") || t.includes("freelance")) return "FREELANCE";
  if (t.includes("intern")) return "ESTAGIO";
  return "CLT";
}

export async function scrapeRemotive(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 200 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];
  const seen = new Set<number>();

  try {
    for (const category of CATEGORIES) {
      if (vagas.length >= maxResults) break;

      const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=50`;
      const res = await axios.get<{ jobs: RemotiveJob[] }>(url, {
        timeout: 15_000,
        headers: { "User-Agent": "TechJobsBR/1.0 (+https://techjobsbr.com.br)" },
      });

      for (const job of res.data?.jobs ?? []) {
        if (vagas.length >= maxResults) break;
        if (seen.has(job.id)) continue;
        seen.add(job.id);

        vagas.push({
          titulo: job.title,
          descricao: job.description ?? "",
          empresaNome: job.company_name,
          empresaSite: job.company_url,
          publicadaEm: job.publication_date ? new Date(job.publication_date) : undefined,
          modalidade: "REMOTA",
          nivel: guessNivel(job.title),
          cargo: guessCargo(job.title),
          tipoContrato: mapJobType(job.job_type),
          tecnologias: extractTechs(`${job.title} ${(job.tags ?? []).join(" ")} ${job.description ?? ""}`),
          fonteExterna: job.url,
          nomeFonte: "Remotive",
        });
      }
    }
  } catch (err) {
    errors.push(`Remotive: ${(err as Error).message}`);
  }

  return { source: "Remotive", vagas, errors };
}
