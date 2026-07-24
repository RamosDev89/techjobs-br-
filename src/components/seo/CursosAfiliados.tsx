import { GraduationCap, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCursosParaTech } from "@/lib/cursos-afiliados";

const PLATAFORMA_COLOR: Record<string, string> = {
  Rocketseat: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Alura:      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  DIO:        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

interface CursosAfiliadosProps {
  techs: string[];
}

export function CursosAfiliados({ techs }: CursosAfiliadosProps) {
  const cursos = getCursosParaTech(techs);
  if (cursos.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Aprenda estas tecnologias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {cursos.map((curso) => (
          <a
            key={curso.href}
            href={curso.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
          >
            <Badge
              className={`text-xs font-normal shrink-0 ${PLATAFORMA_COLOR[curso.plataforma] ?? "bg-muted text-muted-foreground"}`}
              variant="secondary"
            >
              {curso.plataforma}
            </Badge>
            <span className="text-muted-foreground group-hover:text-primary line-clamp-1 flex-1">
              {curso.nome}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          </a>
        ))}
        <p className="text-xs text-muted-foreground/70 pt-1">
          Links de parceiros — sem custo extra pra você
        </p>
      </CardContent>
    </Card>
  );
}
