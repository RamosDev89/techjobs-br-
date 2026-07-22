import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import {
  LANDING_CITIES,
  SLUG_BY_TECH,
  LANDING_INDEX_THRESHOLD,
} from '@/lib/seo-landings'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://techjobsbr.com.br'

const REMOTE_MODALIDADES = new Set(['REMOTA', 'REMOTA_INTERNACIONAL'])

function bump(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/vagas`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ]

  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true,
        OR: [{ expiradaEm: null }, { expiradaEm: { gt: new Date() } }],
      },
      select: { slug: true, atualizadaEm: true, tecnologias: true, cidade: true, modalidade: true },
      orderBy: { atualizadaEm: 'desc' },
      take: 50000,
    })

    // Agrega counts de landings em JS (zero queries extras)
    const counts = new Map<string, number>()
    for (const v of vagas) {
      const cidadeMatch = v.cidade
        ? LANDING_CITIES.find((c) =>
            c.matchers.some((m) => v.cidade!.toLowerCase().includes(m))
          )
        : undefined
      const isRemote = REMOTE_MODALIDADES.has(v.modalidade)

      for (const tech of v.tecnologias) {
        const ts = SLUG_BY_TECH[tech]
        if (!ts) continue
        bump(counts, ts)
        if (isRemote) bump(counts, `${ts}-remoto`)
        if (cidadeMatch) bump(counts, `${ts}-${cidadeMatch.slug}`)
      }
    }

    const landingRoutes: MetadataRoute.Sitemap = [...counts.entries()]
      .filter(([, n]) => n >= LANDING_INDEX_THRESHOLD)
      .map(([slug]) => ({
        url: `${BASE_URL}/vagas/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))

    const vagaRoutes: MetadataRoute.Sitemap = vagas.map((v) => ({
      url: `${BASE_URL}/vagas/${v.slug}`,
      lastModified: v.atualizadaEm,
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    return [...staticRoutes, ...landingRoutes, ...vagaRoutes]
  } catch (e) {
    console.error('Sitemap error:', e)
    return staticRoutes
  }
}
