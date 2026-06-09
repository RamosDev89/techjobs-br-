import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://techjobs-br.vercel.app'

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
      select: { slug: true, atualizadaEm: true },
      orderBy: { atualizadaEm: 'desc' },
      take: 50000,
    })

    const vagaRoutes: MetadataRoute.Sitemap = vagas.map((v) => ({
      url: `${BASE_URL}/vagas/${v.slug}`,
      lastModified: v.atualizadaEm,
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    return [...staticRoutes, ...vagaRoutes]
  } catch (e) {
    console.error('Sitemap error:', e)
    return staticRoutes
  }
}