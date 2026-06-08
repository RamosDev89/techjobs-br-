import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Star,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSalary, timeAgo } from "@/lib/utils";
import type { VagaComEmpresa } from "@/types";

const modalidadeLabel: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDA: "Híbrida",
  REMOTA: "Remota",
  REMOTA_INTERNACIONAL: "Remota Internacional",
};

const nivelLabel: Record<string, string> = {
  ESTAGIO: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  GERENCIA: "Gerência",
};

const modalidadeVariant: Record<string, "default" | "secondary" | "success" | "info" | "warning"> = {
  PRESENCIAL: "secondary",
  HIBRIDA: "warning",
  REMOTA: "success",
  REMOTA_INTERNACIONAL: "info",
};

interface VagaCardProps {
  vaga: VagaComEmpresa;
}

export function VagaCard({ vaga }: VagaCardProps) {
  const salario = formatSalary(vaga.salarioMin, vaga.salarioMax, vaga.moeda);
  const localidade = [vaga.cidade, vaga.estado].filter(Boolean).join(", ");

  return (
    <Card className={`group hover:shadow-md transition-shadow ${vaga.destacada ? "border-primary/50 shadow-sm" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo empresa */}
          <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {vaga.empresa.logo ? (
              <Image
                src={vaga.empresa.logo}
                alt={vaga.empresa.nome}
                fill
                className="object-contain p-1"
                sizes="48px"
              />
            ) : (
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/vagas/${vaga.slug}`}
                  className="font-semibold text-base hover:text-primary transition-colors line-clamp-1"
                >
                  {vaga.titulo}
                  {vaga.destacada && (
                    <Star className="inline ml-1.5 h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  )}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">{vaga.empresa.nome}</p>
              </div>

              {vaga.fonteExterna && (
                <a
                  href={vaga.fonteExterna}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title={`Ver no ${vaga.nomeFonte}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={modalidadeVariant[vaga.modalidade] ?? "secondary"}>
                {modalidadeLabel[vaga.modalidade]}
              </Badge>
              <Badge variant="outline">{nivelLabel[vaga.nivel]}</Badge>
              <Badge variant="outline">{vaga.tipoContrato}</Badge>
              {vaga.nomeFonte && (
                <Badge variant="secondary" className="text-xs">
                  {vaga.nomeFonte}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              {localidade && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {localidade}
                </span>
              )}
              {salario !== "A combinar" && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {salario}
                </span>
              )}
              <span className="flex items-center gap-1 ml-auto">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(vaga.criadaEm)}
              </span>
            </div>

            {vaga.tecnologias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {vaga.tecnologias.slice(0, 6).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {vaga.tecnologias.length > 6 && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
                    +{vaga.tecnologias.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
