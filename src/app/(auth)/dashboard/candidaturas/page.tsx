"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface Candidatura {
  id: string;
  status: string;
  criadaEm: string;
  vaga: {
    id: string;
    titulo: string;
    slug: string;
    modalidade: string;
    nivel: string;
    fonteExterna: string | null;
    empresa: {
      nome: string;
      logo: string | null;
      slug: string;
    };
  };
}

const statusLabel: Record<string, string> = {
  ENVIADA: "Enviada",
  VISUALIZADA: "Visualizada",
  ENTREVISTA: "Entrevista",
  REJEITADA: "Rejeitada",
  APROVADA: "Aprovada",
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "destructive" | "info"> = {
  ENVIADA: "secondary",
  VISUALIZADA: "info",
  ENTREVISTA: "warning" as "info",
  REJEITADA: "destructive",
  APROVADA: "success",
};

export default function CandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidaturas")
      .then((r) => r.json())
      .then((data) => setCandidaturas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
        <p className="text-muted-foreground">
          {candidaturas.length} candidatura{candidaturas.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : candidaturas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Você ainda não se candidatou a nenhuma vaga.</p>
          <Link href="/vagas" className="text-primary hover:underline">
            Explorar vagas →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {candidaturas.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {c.vaga.empresa.logo ? (
                      <Image src={c.vaga.empresa.logo} alt={c.vaga.empresa.nome} fill className="object-contain p-1" sizes="48px" />
                    ) : (
                      <Briefcase className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/vagas/${c.vaga.slug}`} className="font-medium hover:text-primary transition-colors">
                        {c.vaga.titulo}
                      </Link>
                      {c.vaga.fonteExterna && (
                        <a href={c.vaga.fonteExterna} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.vaga.empresa.nome}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusVariant[c.status] ?? "secondary"}>
                        {statusLabel[c.status] ?? c.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.criadaEm)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
