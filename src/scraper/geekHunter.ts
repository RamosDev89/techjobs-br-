import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

export async function scrapeGeekHunter(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 50 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  try {
    // GeekHunter is client-side rendered (Chakra UI SPA) — cheerio cannot extract job cards.
    // Needs Playwright/Puppeteer for dynamic rendering. Returning empty for now.
    return { source: "GeekHunter", vagas, errors };

    // eslint-disable-next-line no-unreachable
    const res = await axios.get("https://www.geekhunter.com.br/vagas", {
      timeout: 20_000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(res.data as string);

    $(".job-card, [class*='job-card'], [data-testid='job-card']").each((_, el) => {
      if (vagas.length >= maxResults) return false;

      const titulo = $(el).find("h2, h3, [class*='title']").first().text().trim();
      if (!titulo) return;

      const empresa = $(el).find("[class*='company'], [class*='employer']").first().text().trim() || "Empresa";
      const link = $(el).find("a").first().attr("href") ?? "";
      const fullLink = link.startsWith("http") ? link : `https://www.geekHunter.com.br${link}`;
      const descEl = $(el).find("p, [class*='description']").first().text().trim();
      const tags = $(el).find("[class*='tag'], [class*='tech'], [class*='stack']")
        .map((_, t) => $(t).text().trim())
        .get()
        .filter(Boolean);

      const text = titulo.toLowerCase() + descEl.toLowerCase();
      let modalidade: ScrapedVaga["modalidade"] = "REMOTA";
      if (text.includes("presencial")) modalidade = "PRESENCIAL";
      else if (text.includes("híbrido") || text.includes("hibrido")) modalidade = "HIBRIDA";

      vagas.push({
        titulo,
        descricao: descEl,
        empresaNome: empresa,
        modalidade,
        nivel: guessNivel(titulo),
        cargo: guessCargo(titulo),
        tipoContrato: "PJ",
        tecnologias: tags.length > 0 ? tags : extractTechs(titulo + " " + descEl),
        fonteExterna: fullLink,
        nomeFonte: "GeekHunter",
      });
    });
  } catch (err) {
    errors.push(`GeekHunter: ${(err as Error).message}`);
  }

  return { source: "GeekHunter", vagas, errors };
}
