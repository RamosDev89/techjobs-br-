import axios from "axios";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

// BR tech companies known to use Lever — 404s are silently skipped
const COMPANIES = [
  "creditas",
  "loft",
  "neon",
  "zup",
  "resultadosdigitais",
  "rdstation",
  "contaazul",
  "picpay",
  "pagseguro",
  "linx",
  "senior-sistemas",
  "mobi7",
];

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt: number;
  categories: {
    location?: string;
    commitment?: string;
    team?: string;
  };
  descriptionPlain?: string;
  description?: string;
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

function mapCommitment(c?: string): ScrapedVaga["tipoContrato"] {
  if (!c) return "CLT";
  const t = c.toLowerCase();
  if (t.includes("contract") || t.includes("freelance")) return "PJ";
  if (t.includes("intern")) return "ESTAGIO";
  if (t.includes("trainee")) return "TRAINEE";
  return "CLT";
}

function formatCompanyName(token: string): string {
  return token
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function scrapeLever(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 200 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  for (const company of COMPANIES) {
    if (vagas.length >= maxResults) break;
    try {
      const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
      const res = await axios.get<LeverPosting[]>(url, {
        timeout: 15_000,
        headers: { "User-Agent": "TechJobsBR/1.0 (+https://techjobsbr.com.br)" },
      });

      for (const job of res.data ?? []) {
        if (vagas.length >= maxResults) break;
        const location = job.categories?.location ?? "";
        const [city, state] = parseLocation(location);

        vagas.push({
          titulo: job.text,
          descricao: job.descriptionPlain ?? job.description ?? "",
          empresaNome: formatCompanyName(company),
          publicadaEm: job.createdAt ? new Date(job.createdAt) : undefined,
          modalidade: inferModalidade(location),
          nivel: guessNivel(job.text),
          cargo: guessCargo(job.text),
          tipoContrato: mapCommitment(job.categories?.commitment),
          estado: state,
          cidade: city,
          tecnologias: extractTechs(`${job.text} ${job.descriptionPlain ?? ""}`),
          fonteExterna: job.hostedUrl,
          nomeFonte: "Lever",
        });
      }
    } catch (err: any) {
      // 404 = company not on Lever, skip silently
      if (err?.response?.status !== 404) {
        errors.push(`Lever/${company}: ${(err as Error).message}`);
      }
    }
  }

  return { source: "Lever", vagas, errors };
}
