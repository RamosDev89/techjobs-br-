import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Links estáticos — sem query DB. Homepage revalidate=300 permanece barato.
// Qualquer combo que for thin (<3 vagas) é noindex mas ainda follow; link não quebra.

const TOP_TECHS = [
  { label: "React",       slug: "react" },
  { label: "Node.js",     slug: "nodejs" },
  { label: "Python",      slug: "python" },
  { label: "TypeScript",  slug: "typescript" },
  { label: "Java",        slug: "java" },
  { label: "AWS",         slug: "aws" },
  { label: "JavaScript",  slug: "javascript" },
  { label: ".NET",        slug: "dotnet" },
  { label: "Angular",     slug: "angular" },
  { label: "Vue",         slug: "vue" },
  { label: "Docker",      slug: "docker" },
  { label: "Kubernetes",  slug: "kubernetes" },
];

const REMOTE_TECHS = [
  { label: "React Remoto",      slug: "react-remoto" },
  { label: "Node.js Remoto",    slug: "nodejs-remoto" },
  { label: "Python Remoto",     slug: "python-remoto" },
  { label: "Java Remoto",       slug: "java-remoto" },
  { label: "TypeScript Remoto", slug: "typescript-remoto" },
  { label: "AWS Remoto",        slug: "aws-remoto" },
];

const CITY_TECH = [
  { label: "React SP",    slug: "react-sao-paulo" },
  { label: "Python SP",   slug: "python-sao-paulo" },
  { label: "Java SP",     slug: "java-sao-paulo" },
  { label: "React RJ",    slug: "react-rio-de-janeiro" },
  { label: "Node.js SP",  slug: "nodejs-sao-paulo" },
  { label: "React BH",    slug: "react-belo-horizonte" },
  { label: "Python RJ",   slug: "python-rio-de-janeiro" },
  { label: "Java RJ",     slug: "java-rio-de-janeiro" },
  { label: "React Curitiba", slug: "react-curitiba" },
];

function LinkBadge({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-accent text-xs font-normal"
      >
        {label}
      </Badge>
    </Link>
  );
}

interface LandingLinksProps {
  compact?: boolean;
}

export function LandingLinks({ compact = false }: LandingLinksProps) {
  return (
    <section className="py-8 border-t">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          Buscar por tecnologia
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {TOP_TECHS.map((t) => (
            <LinkBadge key={t.slug} href={`/vagas/${t.slug}`} label={t.label} />
          ))}
        </div>

        {!compact && (
          <>
            <p className="text-sm font-medium text-muted-foreground mb-3">Vagas remotas</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {REMOTE_TECHS.map((t) => (
                <LinkBadge key={t.slug} href={`/vagas/${t.slug}`} label={t.label} />
              ))}
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-3">Por cidade</p>
            <div className="flex flex-wrap gap-2">
              {CITY_TECH.map((t) => (
                <LinkBadge key={t.slug} href={`/vagas/${t.slug}`} label={t.label} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
