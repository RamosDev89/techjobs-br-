import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://techjobs-br.vercel.app'

export async function GET() {
  let vagaRoutes: { url: string; lastmod: string }[] = []

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

    vagaRoutes = vagas.map((v) => ({
      url: `${BASE_URL}/vagas/${v.slug}`,
      lastmod: v.atualizadaEm.toISOString(),
    }))
  } catch (e) {
    console.error('Sitemap error:', e)
  }

  const staticRoutes = [
    { url: BASE_URL, lastmod: new Date().toISOString(), changefreq: 'hourly', priority: '1.0' },
    { url: `${BASE_URL}/vagas`, lastmod: new Date().toISOString(), changefreq: 'hourly', priority: '0.9' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...vagaRoutes.map(v => ({ ...v, changefreq: 'daily', priority: '0.7' }))]
  .map(r => `  <url>
    <loc>${r.url}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}