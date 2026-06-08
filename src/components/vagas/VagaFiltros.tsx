"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CARGOS = [
  { value: "", label: "Todos os cargos" },
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "FULLSTACK", label: "Fullstack" },
  { value: "MOBILE", label: "Mobile" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA", label: "Dados" },
  { value: "QA", label: "QA / Testes" },
  { value: "DESIGN", label: "Design" },
  { value: "PRODUTO", label: "Produto" },
  { value: "SEGURANCA", label: "Segurança" },
  { value: "IA", label: "IA / ML" },
  { value: "OUTRO", label: "Outro" },
];

const MODALIDADES = [
  { value: "", label: "Todas modalidades" },
  { value: "REMOTA", label: "Remota" },
  { value: "HIBRIDA", label: "Híbrida" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTA_INTERNACIONAL", label: "Remota Internacional" },
];

const NIVEIS = [
  { value: "", label: "Todos os níveis" },
  { value: "ESTAGIO", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
  { value: "ESPECIALISTA", label: "Especialista" },
  { value: "GERENCIA", label: "Gerência" },
];

const CONTRATOS = [
  { value: "", label: "Todos os contratos" },
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "ESTAGIO", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
];

const FONTES = [
  { value: "", label: "Todas as fontes" },
  { value: "Gupy", label: "Gupy" },
  { value: "Indeed", label: "Indeed" },
  { value: "Programathor", label: "Programathor" },
  { value: "GeekHunter", label: "GeekHunter" },
];

export function VagaFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/vagas?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value;
    updateParam("q", q);
  };

  const clearFilters = () => {
    router.push("/vagas");
  };

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("cargo") ||
    searchParams.has("modalidade") ||
    searchParams.has("nivel") ||
    searchParams.has("tipoContrato") ||
    searchParams.has("fonte");

  return (
    <div className="bg-background border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 font-medium text-sm">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {hasFilters && (
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={clearFilters}>
            Limpar
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Buscar vagas, tecnologias..."
            defaultValue={searchParams.get("q") ?? ""}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm">Buscar</Button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
        <Select
          value={searchParams.get("cargo") ?? ""}
          onChange={(e) => updateParam("cargo", e.target.value)}
        >
          {CARGOS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          value={searchParams.get("modalidade") ?? ""}
          onChange={(e) => updateParam("modalidade", e.target.value)}
        >
          {MODALIDADES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          value={searchParams.get("nivel") ?? ""}
          onChange={(e) => updateParam("nivel", e.target.value)}
        >
          {NIVEIS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          value={searchParams.get("tipoContrato") ?? ""}
          onChange={(e) => updateParam("tipoContrato", e.target.value)}
        >
          {CONTRATOS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          value={searchParams.get("fonte") ?? ""}
          onChange={(e) => updateParam("fonte", e.target.value)}
        >
          {FONTES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}
