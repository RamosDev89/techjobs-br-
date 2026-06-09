"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface AlertaFiltros {
  q?: string;
  cargo?: string;
  modalidade?: string;
  nivel?: string;
  tipoContrato?: string;
  estado?: string;
}

interface Alerta {
  id: string;
  filtros: AlertaFiltros;
  ativo: boolean;
  criadaEm: string;
  ultimaExecucao: string | null;
}

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

const cargoLabel = (v: string) => CARGOS.find((c) => c.value === v)?.label ?? v;
const modalidadeLabel = (v: string) => MODALIDADES.find((m) => m.value === v)?.label ?? v;
const nivelLabel = (v: string) => NIVEIS.find((n) => n.value === v)?.label ?? v;
const contratoLabel = (v: string) => CONTRATOS.find((c) => c.value === v)?.label ?? v;

const ESTADOS = [
  "", "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filtros, setFiltros] = useState<AlertaFiltros>({});
  const [error, setError] = useState<string | null>(null);

  const loadAlertas = () => {
    setLoading(true);
    fetch("/api/alertas")
      .then((r) => r.json())
      .then((data) => setAlertas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAlertas(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const cleanFiltros = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v && v.trim() !== "")
    );

    if (Object.keys(cleanFiltros).length === 0) {
      setError("Configure pelo menos um filtro antes de criar o alerta.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/alertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filtros: cleanFiltros }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao criar alerta.");
      return;
    }

    setFiltros({});
    setShowForm(false);
    loadAlertas();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/alertas?id=${id}`, { method: "DELETE" });
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Alertas de vagas</h1>
          <p className="text-muted-foreground text-sm">Receba novas vagas por email a cada 6 horas.</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Novo alerta
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Configurar alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                placeholder="Palavra-chave (ex: React, Node.js, Python...)"
                value={filtros.q ?? ""}
                onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filtros.cargo ?? ""}
                  onChange={(e) => setFiltros((f) => ({ ...f, cargo: e.target.value }))}
                >
                  {CARGOS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Select
                  value={filtros.modalidade ?? ""}
                  onChange={(e) => setFiltros((f) => ({ ...f, modalidade: e.target.value }))}
                >
                  {MODALIDADES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Select
                  value={filtros.nivel ?? ""}
                  onChange={(e) => setFiltros((f) => ({ ...f, nivel: e.target.value }))}
                >
                  {NIVEIS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Select
                  value={filtros.tipoContrato ?? ""}
                  onChange={(e) => setFiltros((f) => ({ ...f, tipoContrato: e.target.value }))}
                >
                  {CONTRATOS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <Select
                value={filtros.estado ?? ""}
                onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
              >
                <option value="">Todos os estados</option>
                {ESTADOS.filter(Boolean).map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Criando..." : "Criar alerta"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowForm(false); setError(null); setFiltros({}); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : alertas.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Nenhum alerta configurado.</p>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Criar primeiro alerta
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <Card key={alerta.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {alerta.filtros.q && (
                        <Badge variant="default">"{alerta.filtros.q}"</Badge>
                      )}
                      {alerta.filtros.cargo && (
                        <Badge variant="secondary">{cargoLabel(alerta.filtros.cargo)}</Badge>
                      )}
                      {alerta.filtros.modalidade && (
                        <Badge variant="secondary">{modalidadeLabel(alerta.filtros.modalidade)}</Badge>
                      )}
                      {alerta.filtros.nivel && (
                        <Badge variant="secondary">{nivelLabel(alerta.filtros.nivel)}</Badge>
                      )}
                      {alerta.filtros.tipoContrato && (
                        <Badge variant="secondary">{contratoLabel(alerta.filtros.tipoContrato)}</Badge>
                      )}
                      {alerta.filtros.estado && (
                        <Badge variant="secondary">{alerta.filtros.estado}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Criado {timeAgo(alerta.criadaEm)}
                      {alerta.ultimaExecucao && ` · Último envio ${timeAgo(alerta.ultimaExecucao)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(alerta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
