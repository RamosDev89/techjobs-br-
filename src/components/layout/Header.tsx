"use client";

import Link from "next/link";
import { Briefcase, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Sheet, SheetHeader, SheetTitle, SheetContent } from "@/components/ui/sheet";

const navLinks = [
  { href: "/vagas", label: "Vagas" },
  { href: "/empresas", label: "Empresas" },
  { href: "/anuncie", label: "Para Empresas" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_1px_0_hsl(var(--border))]">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl mr-6 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-[0_2px_8px_hsl(var(--primary)/0.35)]">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span>TechJobs <span className="text-primary">BR</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-2 rounded-lg transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild className="rounded-lg">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild className="rounded-lg">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <SheetContent>
          <nav className="flex flex-col gap-2 mt-4" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold hover:text-primary hover:bg-secondary px-3 py-2.5 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t mt-2">
              <Button variant="outline" asChild className="rounded-lg">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild className="rounded-lg">
                <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
                  Criar conta
                </Link>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
