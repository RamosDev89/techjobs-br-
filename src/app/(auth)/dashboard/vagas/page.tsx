"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface Vaga {
  id: string;
  titulo: string;
  slug: string;
  ativa: boolean;
  modalidade: string;
  nivel: string;
  criadaEm: string;
  visualizacoes: number;
  _count?: { candidaturas: number };
}

interface FormData {
  titulo: string;
  descricao: string;
  modalidade: string;
  nivel: string;
  cargo: string;
  tipoContrato: string;
  tecnologias: string;
  estado: string;
  cidade: string;
  salarioMin: string;
  salarioMax: string;
  empresaId: string;
}

const INITIAL_FORM: FormData = {
  titulo: "",
  descricao: "",
  modalidade: "REMOTA",
  nivel: "PLENO",
  cargo: "FULLSTACK",
  tipoContrato: "CLT",
  tecnologias: "",
  estado: "",
  cidade: "",
  salarioMin: "",
  salarioMax: "",
  empresaId: "",
};

export default function DashboardVagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVagas = () => {
    fetch("/api/vagas?limit=50")
      .then((r) => r.json())
      .then((d) => setVagas(Array.isArray(d.data) ? d.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVagas(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tecnologias: form.tecnologias.split(",").map((t) => t.trim()).filter(Boolean),
        salarioMin: form.salarioMin ? Number(form.salarioMin) : undefined,
        salarioMax: form.salarioMax ? Number(form.salarioMax) : undefined,
        beneficios: [],
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const d = await res.json() as { error?: string };
      setError(d.error ?? "Erro ao criar vaga");
      return;
    }

    setDialogOpen(false);
    setForm(INITIAL_FORM);
    fetchVagas();
  };

  const toggleAtiva = async (vaga: Vaga) => {
    await fetch(`/api/vagas/${vaga.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativa: !vaga.ativa }),
    });
    fetchVagas();
  };

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vagas</h1>
          <p className="text-muted-foreground">{vagas.length} vaga{vagas.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova vaga
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : vagas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Nenhuma vaga publicada ainda.</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Publicar primeira vaga
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {vagas.map((vaga) => (
            <Card key={vaga.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{vaga.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={vaga.ativa ? "success" : "secondary"}>
                      {vaga.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{vaga.modalidade}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(vaga.criadaEm)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{vaga.visualizacoes} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleAtiva(vaga)} title={vaga.ativa ? "Desativar" : "Ativar"}>
                    {vaga.ativa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Publicar nova vaga</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título da vaga *</label>
              <Input placeholder="Ex: Desenvolvedor React Sênior" value={form.titulo} onChange={set("titulo")} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Cargo *</label>
                <Select value={form.cargo} onChange={set("cargo")}>
                  <option value="FRONTEND">Frontend</option>
                  <option value="BACKEND">Backend</option>
                  <option value="FULLSTACK">Fullstack</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="DEVOPS">DevOps</option>
                  <option value="DATA">Dados</option>
                  <option value="QA">QA</option>
                  <option value="DESIGN">Design</option>
                  <option value="PRODUTO">Produto</option>
                  <option value="SEGURANCA">Segurança</option>
                  <option value="IA">IA/ML</option>
                  <option value="OUTRO">Outro</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Nível *</label>
                <Select value={form.nivel} onChange={set("nivel")}>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="GERENCIA">Gerência</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Modalidade *</label>
                <Select value={form.modalidade} onChange={set("modalidade")}>
                  <option value="REMOTA">Remota</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="REMOTA_INTERNACIONAL">Remota Internacional</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de contrato *</label>
                <Select value={form.tipoContrato} onChange={set("tipoContrato")}>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="ESTAGIO">Estágio</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <Input placeholder="SP" value={form.estado} onChange={set("estado")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cidade</label>
                <Input placeholder="São Paulo" value={form.cidade} onChange={set("cidade")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ID da empresa *</label>
                <Input placeholder="cuid..." value={form.empresaId} onChange={set("empresaId")} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Salário mín. (BRL)</label>
                <Input type="number" placeholder="8000" value={form.salarioMin} onChange={set("salarioMin")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Salário máx. (BRL)</label>
                <Input type="number" placeholder="15000" value={form.salarioMax} onChange={set("salarioMax")} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tecnologias (separadas por vírgula)</label>
              <Input placeholder="React, TypeScript, Node.js" value={form.tecnologias} onChange={set("tecnologias")} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Descrição da vaga *</label>
              <Textarea
                placeholder="Descreva as responsabilidades, requisitos e diferenciais da vaga..."
                value={form.descricao}
                onChange={set("descricao")}
                required
                rows={8}
                minLength={50}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Publicando..." : "Publicar vaga"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
