import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs, httpsAgent } from "./utils";

interface TramposJob {
  id: number;
  name: string;
  type_name: string | string[];
  category_name: string | string[];
  company_name: string;
  state?: string;
  city?: string;
  home_office?: boolean;
  published_at: string;
}

interface TramposPageData {
  highlighted_opportunities?: TramposJob[];
  opportunity_groups?: Array<{ opportunities?: TramposJob[] }>;
}

const PAGES = [
  "https://trampos.co/oportunidades?categoria=tecnologia",
  "https://trampos.co/oportunidades?categoria=design",
];

function mapTipoContrato(typeName: string | string[]): ScrapedVaga["tipoContrato"] {
  const t = (Array.isArray(typeName) ? typeName.join(" ") : typeName).toLowerCase();
  if (t.includes("estágio") || t.includes("estagio")) return "ESTAGIO";
  if (t.includes("trainee")) return "TRAINEE";
  if (t.includes("freelance") || t.includes("freela")) return "FREELANCE";
  if (t.includes("pj") || t.includes("pessoa jurídica")) return "PJ";
  return "CLT";
}

function extractJobs(html: string): TramposJob[] {
  const jobs: TramposJob[] = [];
  const seen = new Set<number>();

  // highlighted_opportunities — flat array embedded in page JSON
  const highlightedMatch = html.match(/"highlighted_opportunities"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/);
  if (highlightedMatch) {
    try {
      const parsed = JSON.parse(highlightedMatch[1]) as TramposJob[];
      for (const j of parsed) {
        if (!seen.has(j.id)) { seen.add(j.id); jobs.push(j); }
      }
    } catch { /* ignore */ }
  }

  // opportunity_groups[].opportunities — nested structure
  const groupsMatch = html.match(/"opportunity_groups"\s*:\s*(\[[\s\S]*?\])\s*\}/);
  if (groupsMatch) {
    try {
      const groups = JSON.parse(groupsMatch[1]) as Array<{ opportunities?: TramposJob[] }>;
      for (const g of groups) {
        for (const j of g.opportunities ?? []) {
          if (!seen.has(j.id)) { seen.add(j.id); jobs.push(j); }
        }
      }
    } catch { /* ignore */ }
  }

  return jobs;
}

export async function scrapeTrampos(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 100 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];
  const seen = new Set<number>();

  for (const url of PAGES) {
    if (vagas.length >= maxResults) break;
    try {
      const res = await axios.get<string>(url, {
        timeout: 20_000,
        httpsAgent,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
          Accept: "text/html",
        },
      });

      const jobs = extractJobs(res.data);

      for (const job of jobs) {
        if (vagas.length >= maxResults) break;
        if (seen.has(job.id)) continue;
        seen.add(job.id);

        vagas.push({
          titulo: job.name,
          descricao: job.name,
          empresaNome: job.company_name || "Empresa",
          publicadaEm: job.published_at ? new Date(job.published_at) : undefined,
          modalidade: job.home_office ? "REMOTA" : "PRESENCIAL",
          nivel: guessNivel(job.name),
          cargo: guessCargo(job.name),
          tipoContrato: mapTipoContrato(job.type_name ?? ""),
          estado: job.state,
          cidade: job.city,
          tecnologias: extractTechs(job.name),
          fonteExterna: `https://trampos.co/oportunidades/${job.id}`,
          nomeFonte: "Trampos",
        });
      }
    } catch (err) {
      errors.push(`Trampos (${url}): ${(err as Error).message}`);
    }
  }

  return { source: "Trampos", vagas, errors };
}
