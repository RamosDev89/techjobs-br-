import axios from "axios";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

// BR tech companies known to use Greenhouse — 404s are silently skipped
const COMPANIES = [
  "nubank",
  "quintoandar",
  "gympass",
  "hotmart",
  "vtex",
  "picpay",
  "stone",
  "olist",
  "dock",
  "cloudwalk",
  "pagar-me",
  "contaazul",
  "totvs",
  "ifood",
  "loft-realty",
];

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  location: { name: string };
  absolute_url: string;
  content?: string;
}

function parseLocation(loc: string): [string | undefined, string | undefined] {
  if (!loc) return [undefined, undefined];
  const parts = loc.split(",").map((p) => p.trim());
  return [parts[0], parts[1]];
}

function inferModalidade(loc: string): ScrapedVaga["modalidade"] {
  const l = loc.toLowerCase();
  if (l.includes("remote") || l.includes("remoto")) return "REMOTA";
  if (l.includes("hybrid") || l.includes("híbrido")) return "HIBRIDA";
  if (!loc) return "REMOTA";
  return "PRESENCIAL";
}

function formatCompanyName(token: string): string {
  return token
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function scrapeGreenhouse(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 200 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  for (const company of COMPANIES) {
    if (vagas.length >= maxResults) break;
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;
      const res = await axios.get<{ jobs: GreenhouseJob[] }>(url, {
        timeout: 15_000,
        headers: { "User-Agent": "TechJobsBR/1.0 (+https://techjobsbr.com.br)" },
      });

      for (const job of res.data?.jobs ?? []) {
        if (vagas.length >= maxResults) break;
        const location = job.location?.name ?? "";
        const [city, state] = parseLocation(location);

        vagas.push({
          titulo: job.title,
          descricao: job.content ?? "",
          empresaNome: formatCompanyName(company),
          publicadaEm: job.updated_at ? new Date(job.updated_at) : undefined,
          modalidade: inferModalidade(location),
          nivel: guessNivel(job.title),
          cargo: guessCargo(job.title),
          tipoContrato: "CLT",
          estado: state,
          cidade: city,
          tecnologias: extractTechs(`${job.title} ${job.content ?? ""}`),
          fonteExterna: job.absolute_url,
          nomeFonte: "Greenhouse",
        });
      }
    } catch (err: any) {
      // 404 = company not on Greenhouse, skip silently
      if (err?.response?.status !== 404) {
        errors.push(`Greenhouse/${company}: ${(err as Error).message}`);
      }
    }
  }

  return { source: "Greenhouse", vagas, errors };
}
