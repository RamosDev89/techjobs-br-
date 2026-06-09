import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

interface TramposJob {
  id: number;
  name: string;
  type_name: string;
  category_name: string;
  company_name: string;
  state?: string;
  city?: string;
  home_office: boolean;
  published_at: string;
}

interface TramposInitialLoad {
  opportunities?: TramposJob[];
  jobs?: TramposJob[];
  data?: TramposJob[];
}

const PAGES = [
  "https://trampos.co/oportunidades?categoria=tecnologia",
  "https://trampos.co/oportunidades?categoria=design",
];

function mapTipoContrato(typeName: string): ScrapedVaga["tipoContrato"] {
  const t = typeName.toLowerCase();
  if (t.includes("estágio") || t.includes("estagio")) return "ESTAGIO";
  if (t.includes("trainee")) return "TRAINEE";
  if (t.includes("freelance") || t.includes("freela")) return "FREELANCE";
  if (t.includes("pj") || t.includes("pessoa jurídica")) return "PJ";
  return "CLT";
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
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
          Accept: "text/html",
        },
      });

      const $ = cheerio.load(res.data);

      // Extract window.initialLoad JSON embedded in the page
      let jobs: TramposJob[] = [];
      $("script").each((_, el) => {
        const src = $(el).html() ?? "";
        const match = src.match(/window\.initialLoad\s*=\s*(\{.+?\});/s);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]) as TramposInitialLoad;
            jobs = parsed.opportunities ?? parsed.jobs ?? parsed.data ?? [];
          } catch {
            // ignore parse errors
          }
        }
      });

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
