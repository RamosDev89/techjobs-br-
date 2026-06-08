import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

  const vagas = await prisma.vaga.findMany({
    where: { ativa: true },
    select: { slug: true, criadaEm: true, publicadaEm: true },
    orderBy: { criadaEm: "desc" },
  });

  const vagaUrls: MetadataRoute.Sitemap = vagas.map((v) => ({
    url: `${baseUrl}/vagas/${v.slug}`,
    lastModified: v.publicadaEm ?? v.criadaEm,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/vagas`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...vagaUrls,
  ];
}
