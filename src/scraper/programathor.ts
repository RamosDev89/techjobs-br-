import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

export async function scrapeProgramathor(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 50 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  try {
    const res = await axios.get("https://programathor.com.br/jobs", {
      timeout: 20_000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TechJobsBR/1.0)",
        Accept: "text/html",
      },
    });

    const $ = cheerio.load(res.data as string);

    $(".cell-list").not(".cell-list-content").each((_, el) => {
      if (vagas.length >= maxResults) return false;

      const titleEl = $(el).find("h2, h3, .title").first();
      const titulo = titleEl.text().trim();
      if (!titulo) return;

      const empresa = $(el).find(".company, .company-name").first().text().trim() || "Empresa confidencial";
      const link = $(el).find("a").first().attr("href") ?? "";
      const fullLink = link.startsWith("http") ? link : `https://programathor.com.br${link}`;
      const local = $(el).find(".location, .localization").first().text().trim();
      const descEl = $(el).find(".description, p").first().text().trim();

      let modalidade: ScrapedVaga["modalidade"] = "PRESENCIAL";
      const localLower = local.toLowerCase() + titulo.toLowerCase();
      if (localLower.includes("remoto") || localLower.includes("remote")) modalidade = "REMOTA";
      else if (localLower.includes("híbrido") || localLower.includes("hibrido")) modalidade = "HIBRIDA";

      const [cidade, estado] = local.includes(",")
        ? local.split(",").map((s) => s.trim())
        : [local, undefined];

      vagas.push({
        titulo,
        descricao: descEl,
        empresaNome: empresa,
        modalidade,
        nivel: guessNivel(titulo),
        cargo: guessCargo(titulo),
        tipoContrato: "CLT",
        cidade: cidade || undefined,
        estado: estado || undefined,
        tecnologias: extractTechs(titulo + " " + descEl),
        fonteExterna: fullLink,
        nomeFonte: "Programathor",
      });
    });
  } catch (err) {
    errors.push(`Programathor: ${(err as Error).message}`);
  }

  return { source: "Programathor", vagas, errors };
}
