import pLimit from "p-limit";
import { scrapeGupy } from "./gupy";
import { scrapeProgramathor } from "./programathor";
import { scrapeGeekHunter } from "./geekHunter";
import { scrapeRemotive } from "./remotive";
import { scrapeGreenhouse } from "./greenhouse";
import { scrapeLever } from "./lever";
import { scrapeRemoteOK } from "./remoteok";
import { scrapeTrampos } from "./trampos";
import { scrapeVagasCom } from "./vagascom";
import { scrapeInfoJobs } from "./infojobs";
import { vagaHash, cleanTitulo } from "@/lib/hash";
import { slugify } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type { ScrapedVaga } from "@/types";

const limit = pLimit(3); // 3 scrapers concorrentes

export async function runAllScrapers(): Promise<{
  total: number;
  inserted: number;
  skipped: number;
  errors: string[];
}> {
  const maxPerSource = Number(process.env.SCRAPER_MAX_PER_SOURCE ?? 200);

  const results = await Promise.all([
    limit(() => scrapeGupy({ maxResults: maxPerSource })),
    limit(() => scrapeProgramathor({ maxResults: maxPerSource })),
    limit(() => scrapeGeekHunter({ maxResults: maxPerSource })),
    limit(() => scrapeRemotive({ maxResults: maxPerSource })),
    limit(() => scrapeGreenhouse({ maxResults: maxPerSource })),
    limit(() => scrapeLever({ maxResults: maxPerSource })),
    limit(() => scrapeRemoteOK({ maxResults: maxPerSource })),
    limit(() => scrapeTrampos({ maxResults: maxPerSource })),
    limit(() => scrapeVagasCom({ maxResults: maxPerSource })),
    limit(() => scrapeInfoJobs({ maxResults: maxPerSource })),
  ]);

  const allErrors: string[] = results.flatMap((r) => r.errors);
  const allVagas: ScrapedVaga[] = results.flatMap((r) => r.vagas);

  let inserted = 0;
  let skipped = 0;

  for (const scraped of allVagas) {
    scraped.titulo = cleanTitulo(scraped.titulo);
    const hash = vagaHash(scraped.titulo, scraped.empresaNome, scraped.nomeFonte);

    const exists = await prisma.vaga.findUnique({ where: { hashExterna: hash } });
    if (exists) {
      skipped++;
      continue;
    }

    // Upsert empresa
    const empresaSlug = slugify(scraped.empresaNome);
    const empresa = await prisma.empresa.upsert({
      where: { slug: empresaSlug },
      create: {
        nome: scraped.empresaNome,
        slug: empresaSlug,
        site: scraped.empresaSite,
        tamanho: "PME",
        verificada: false,
      },
      update: {},
    });

    // Generate unique slug for vaga
    const baseSlug = slugify(`${scraped.titulo} ${scraped.empresaNome}`);
    const existingSlug = await prisma.vaga.findUnique({ where: { slug: baseSlug } });
    const vagaSlug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

    await prisma.vaga.create({
      data: {
        titulo: scraped.titulo,
        slug: vagaSlug,
        descricao: scraped.descricao || scraped.titulo,
        empresaId: empresa.id,
        modalidade: scraped.modalidade,
        nivel: scraped.nivel,
        cargo: scraped.cargo,
        tipoContrato: scraped.tipoContrato,
        salarioMin: scraped.salarioMin,
        salarioMax: scraped.salarioMax,
        estado: scraped.estado,
        cidade: scraped.cidade,
        tecnologias: scraped.tecnologias,
        beneficios: [],
        fonteExterna: scraped.fonteExterna,
        nomeFonte: scraped.nomeFonte,
        hashExterna: hash,
        publicadaEm: scraped.publicadaEm ?? new Date(),
        expiradaEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    inserted++;
  }

  return {
    total: allVagas.length,
    inserted,
    skipped,
    errors: allErrors,
  };
}
