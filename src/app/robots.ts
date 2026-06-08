import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vagas"],
        disallow: ["/dashboard", "/api/", "/login", "/cadastro"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
