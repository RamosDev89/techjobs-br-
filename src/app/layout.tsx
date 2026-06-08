import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techjobsbr.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "TechJobs BR — Vagas de tecnologia no Brasil",
    template: "%s | TechJobs BR",
  },
  description:
    "Encontre as melhores vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais. Vagas de Gupy, Indeed, Programathor e GeekHunter em um só lugar.",
  keywords: [
    "vagas tecnologia brasil",
    "emprego programador",
    "vaga desenvolvedor",
    "frontend",
    "backend",
    "fullstack",
    "mobile",
    "devops",
    "remoto",
    "tech jobs brasil",
    "gupy",
    "programathor",
    "geekhunter",
  ],
  authors: [{ name: "TechJobs BR" }],
  creator: "TechJobs BR",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "TechJobs BR",
    title: "TechJobs BR — Vagas de tecnologia no Brasil",
    description:
      "Encontre as melhores vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechJobs BR — Vagas de tecnologia no Brasil",
    description:
      "Encontre as melhores vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais.",
    site: "@techjobsbr",
  },
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4757647693977783"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
