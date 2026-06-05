import { VagaCard } from "./VagaCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { VagaComEmpresa } from "@/types";

interface VagaGridProps {
  vagas: VagaComEmpresa[];
  loading?: boolean;
}

export function VagaGrid({ vagas, loading = false }: VagaGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (vagas.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
        <p className="text-sm mt-1">Tente ajustar os filtros ou buscar por outros termos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vagas.map((vaga) => (
        <VagaCard key={vaga.id} vaga={vaga} />
      ))}
    </div>
  );
}
