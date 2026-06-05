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
  { href: "/para-empresas", label: "Para Empresas" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <span>TechJobs BR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <SheetContent>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild>
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
