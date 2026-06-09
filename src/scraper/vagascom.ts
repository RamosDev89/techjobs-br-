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
  "data-engineer",
  "designer-ux",
  "qa-quality",
];

export async function scrapeVagasCom(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 100 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];
  const seen = new Set<string>();

  for (const kw of SEARCHES) {
    if (vagas.length >= maxResults) break;
    try {
      const url = `https://www.vagas.com.br/vagas-de-${kw}`;
      const res = await axios.get<string>(url, {
        timeout: 20_000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
          Accept: "text/html",
        },
      });

      const $ = cheerio.load(res.data);

      // Job cards: li elements containing a link to /vagas/
      $("li:has(a[href^='/vagas/'])").each((_, el) => {
        if (vagas.length >= maxResults) return false;

        const anchor = $(el).find("a[href^='/vagas/']").first();
        const titulo = anchor.text().trim();
        if (!titulo) return;

        const href = anchor.attr("href") ?? "";
        const fullLink = `https://www.vagas.com.br${href}`;

        if (seen.has(fullLink)) return;
        seen.add(fullLink);

        const paragraphs = $(el).find("p").map((_, p) => $(p).text().trim()).get();
        const empresa = paragraphs[0] ?? "Empresa";
        const locationRaw = paragraphs.find((p) =>
          p.includes("/") || p.toLowerCase().includes("home office") || p.toLowerCase().includes("remot")
        ) ?? "";

        const loc = locationRaw.toLowerCase();
        const modalidade: ScrapedVaga["modalidade"] =
          loc.includes("home office") || loc.includes("remot") ? "REMOTA" :
          loc.includes("híbrido") || loc.includes("hibrido") ? "HIBRIDA" : "PRESENCIAL";

        const [city, state] = locationRaw.includes("/")
          ? locationRaw.split("/").map((s) => s.trim().replace(/\s*\d.*$/, ""))
          : [locationRaw, undefined];

        const descEl = paragraphs.find((p) => p.toLowerCase().startsWith("descrição:")) ?? "";
        const desc = descEl.replace(/^descrição:\s*/i, "");

        vagas.push({
          titulo,
          descricao: desc || titulo,
          empresaNome: empresa || "Empresa",
          modalidade,
          nivel: guessNivel(titulo),
          cargo: guessCargo(titulo),
          tipoContrato: "CLT",
          estado: state?.trim() || undefined,
          cidade: city?.trim() || undefined,
          tecnologias: extractTechs(titulo + " " + desc),
          fonteExterna: fullLink,
          nomeFonte: "Vagas.com.br",
        });
      });
    } catch (err) {
      errors.push(`Vagas.com.br (${kw}): ${(err as Error).message}`);
    }
  }

  return { source: "Vagas.com.br", vagas, errors };
}
