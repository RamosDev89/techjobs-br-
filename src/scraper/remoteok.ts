import axios from "axios";
import type { ScrapedVaga } from "@/types";
import type { ScraperOptions, ScraperResult } from "./types";
import { guessCargo, guessNivel, extractTechs } from "./utils";

interface RemoteOKJob {
  slug: string;
  id: string;
  epoch: number;
  date: string;
  company: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  url: string;
  apply_url: string;
  salary_min: number;
  salary_max: number;
}

// First element is always legal metadata — skip it
function isJob(entry: unknown): entry is RemoteOKJob {
  return typeof (entry as RemoteOKJob).id === "string";
}

export async function scrapeRemoteOK(options: ScraperOptions = {}): Promise<ScraperResult> {
  const { maxResults = 200 } = options;
  const errors: string[] = [];
  const vagas: ScrapedVaga[] = [];

  try {
    const res = await axios.get<unknown[]>("https://remoteok.com/api", {
      timeout: 20_000,
      headers: {
        "User-Agent": "TechJobsBR/1.0 (+https://techjobsbr.com.br)",
        "Accept": "application/json",
      },
    });

    for (const entry of res.data ?? []) {
      if (vagas.length >= maxResults) break;
      if (!isJob(entry)) continue;

      const text = `${entry.position} ${(entry.tags ?? []).join(" ")} ${entry.description ?? ""}`;

      vagas.push({
        titulo: entry.position,
        descricao: entry.description ?? "",
        empresaNome: entry.company,
        publicadaEm: entry.epoch ? new Date(entry.epoch * 1000) : undefined,
        modalidade: "REMOTA",
        nivel: guessNivel(entry.position),
        cargo: guessCargo(entry.position),
        tipoContrato: "CLT",
        salarioMin: entry.salary_min > 0 ? entry.salary_min : undefined,
        salarioMax: entry.salary_max > 0 ? entry.salary_max : undefined,
        tecnologias: extractTechs(text),
        fonteExterna: entry.url,
        nomeFonte: "RemoteOK",
      });
    }
  } catch (err) {
    errors.push(`RemoteOK: ${(err as Error).message}`);
  }

  return { source: "RemoteOK", vagas, errors };
}
