import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

const SEARCHES = [
  "desenvolvedor",
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "designer",
];

export async function scrapeInfoJobs(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 100 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];
  const seen = new Set<string>();

  for (const kw of SEARCHES) {
    if (vagas.length >= maxResults) break;
    try {
      const url = `https://www.infojobs.com.br/empregos.aspx?palabra=${encodeURIComponent(kw)}`;
      const res = await axios.get<string>(url, {
        timeout: 20_000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
          Accept: "text/html",
        },
      });

      const $ = cheerio.load(res.data);

      // Job links match pattern: /vaga-de-*__.*.aspx
      $("a[href*='__'][href$='.aspx']").each((_, el) => {
        if (vagas.length >= maxResults) return false;

        const href = $(el).attr("href") ?? "";
        if (!href.startsWith("/vaga")) return;

        const fullLink = `https://www.infojobs.com.br${href}`;
        if (seen.has(fullLink)) return;
        seen.add(fullLink);

        const titulo = $(el).text().trim();
        if (!titulo || titulo.length < 3) return;

        const card = $(el).closest("li, article, div[class]");
        const paragraphs = card.find("p, span").map((_, p) => $(p).text().trim()).get().filter(Boolean);

        const empresa = paragraphs.find((p) => p.length > 0 && !p.includes("Km") && !p.includes("R$")) ?? "Empresa";
        const locationRaw = paragraphs.find((p) => p.includes(" - ") && p.match(/[A-Z]{2}$/)) ?? "";

        const loc = (locationRaw + titulo).toLowerCase();
        const modalidade: ScrapedVaga["modalidade"] =
          loc.includes("remot") || loc.includes("home office") ? "REMOTA" :
          loc.includes("híbrido") || loc.includes("hibrido") ? "HIBRIDA" : "PRESENCIAL";

        const [city, state] = locationRaw.includes(" - ")
          ? locationRaw.split(" - ").map((s) => s.trim())
          : [locationRaw, undefined];

        const salaryRaw = paragraphs.find((p) => p.includes("R$")) ?? "";
        const salaryMatch = salaryRaw.match(/R\$\s*([\d.,]+)/);
        const salarioMin = salaryMatch
          ? parseFloat(salaryMatch[1].replace(/\./g, "").replace(",", "."))
          : undefined;

        vagas.push({
          titulo,
          descricao: titulo,
          empresaNome: empresa,
          modalidade,
          nivel: guessNivel(titulo),
          cargo: guessCargo(titulo),
          tipoContrato: "CLT",
          estado: state || undefined,
          cidade: city || undefined,
          salarioMin,
          tecnologias: extractTechs(titulo),
          fonteExterna: fullLink,
          nomeFonte: "InfoJobs",
        });
      });
    } catch (err) {
      errors.push(`InfoJobs (${kw}): ${(err as Error).message}`);
    }
  }

  return { source: "InfoJobs", vagas, errors };
}
