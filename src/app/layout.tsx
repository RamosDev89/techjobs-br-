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

export const metadata: Metadata = {
  title: {
    default: "TechJobs BR — Vagas de tecnologia no Brasil",
    template: "%s | TechJobs BR",
  },
  description:
    "Encontre as melhores vagas de tecnologia no Brasil. Frontend, Backend, Fullstack, Mobile, DevOps e mais. Vagas de Gupy, Indeed, Programathor e GeekHunter em um só lugar.",
  keywords: ["vagas", "tecnologia", "brasil", "programador", "desenvolvedor", "emprego tech"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "TechJobs BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
