import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://techjobs-br.vercel.app'

export async function GET() {
  const staticRoutes = [
    { url: BASE_URL, changefreq: 'hourly', priority: '1.0', lastmod: new Date().toISOString() },
    { url: `${BASE_URL}/vagas`, changefreq: 'hourly', priority: '0.9', lastmod: new Date().toISOString() },
  ]

  let vagaRoutes: { url: string; changefreq: string; priority: string; lastmod: string }[] = []

  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true,
        OR: [
          { expiradaEm: null },
          { expiradaEm: { gt: new Date() } },
        ],
      },
      select: { slug: true, atualizadaEm: true },
      orderBy: { atualizadaEm: 'desc' },
      take: 50000,
    })

    vagaRoutes = vagas.map((vaga) => ({
      url: `${BASE_URL}/vagas/${vaga.slug}`,
      changefreq: 'daily',
      priority: '0.7',
      lastmod: vaga.atualizadaEm.toISOString(),
    }))
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
  }

  const allRoutes = [...staticRoutes, ...vagaRoutes]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}