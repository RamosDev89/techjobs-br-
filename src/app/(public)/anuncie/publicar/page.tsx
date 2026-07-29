"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>;
}

const CARGOS = [
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "FULLSTACK", label: "Fullstack" },
  { value: "MOBILE", label: "Mobile" },
  { value: "DEVOPS", label: "DevOps / Infra" },
  { value: "DATA", label: "Dados / BI" },
  { value: "QA", label: "QA / Testes" },
  { value: "DESIGN", label: "Design" },
  { value: "PRODUTO", label: "Produto" },
  { value: "SEGURANCA", label: "Segurança" },
  { value: "IA", label: "IA / ML" },
  { value: "OUTRO", label: "Outro" },
];

const MODALIDADES = [
  { value: "REMOTA", label: "Remota" },
  { value: "HIBRIDA", label: "Híbrida" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTA_INTERNACIONAL", label: "Remota Internacional" },
];

const NIVEIS = [
  { value: "ESTAGIO", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
  { value: "ESPECIALISTA", label: "Especialista" },
  { value: "GERENCIA", label: "Gerência" },
];

const CONTRATOS = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "ESTAGIO", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
];

interface FormData {
  empresaNome: string;
  emailContato: string;
  empresaSite: string;
  titulo: string;
  descricao: string;
  cargo: string;
  modalidade: string;
  nivel: string;
  tipoContrato: string;
  cidade: string;
  estado: string;
  salarioMin: string;
  salarioMax: string;
}

export default function PublicarVagaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [tecnologias, setTecnologias] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [form, setForm] = useState<FormData>({
    empresaNome: "", emailContato: "", empresaSite: "",
    titulo: "", descricao: "", cargo: "", modalidade: "",
    nivel: "", tipoContrato: "", cidade: "", estado: "",
    salarioMin: "", salarioMax: "",
  });

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTech(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const t = techInput.trim();
    if (t && !tecnologias.includes(t)) setTecnologias((prev) => [...prev, t]);
    setTechInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/vaga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaNome: form.empresaNome,
          emailContato: form.emailContato,
          empresaSite: form.empresaSite || undefined,
          titulo: form.titulo,
          descricao: form.descricao,
          cargo: form.cargo,
          modalidade: form.modalidade,
          nivel: form.nivel,
          tipoContrato: form.tipoContrato,
          cidade: form.cidade || undefined,
          estado: form.estado || undefined,
          salarioMin: form.salarioMin ? Number(form.salarioMin) : undefined,
          salarioMax: form.salarioMax ? Number(form.salarioMax) : undefined,
          tecnologias,
          beneficios: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erro ao processar pagamento");
      }

      const data = await res.json() as { init_point: string };
      window.location.href = data.init_point;
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/anuncie" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Publicar vaga destacada</h1>
        <p className="text-muted-foreground mt-1">Preencha os dados da sua empresa e da vaga. Após o pagamento (R$297), a vaga é publicada imediatamente.</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Empresa */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dados da empresa</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="empresaNome">Nome da empresa *</Label>
              <Input id="empresaNome" required value={form.empresaNome} onChange={(e) => set("empresaNome", e.target.value)} placeholder="Ex: Acme Tecnologia" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emailContato">Email de contato *</Label>
              <Input id="emailContato" type="email" required value={form.emailContato} onChange={(e) => set("emailContato", e.target.value)} placeholder="rh@empresa.com.br" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresaSite">Site da empresa (opcional)</Label>
              <Input id="empresaSite" type="url" value={form.empresaSite} onChange={(e) => set("empresaSite", e.target.value)} placeholder="https://empresa.com.br" />
            </div>
          </CardContent>
        </Card>

        {/* Vaga */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dados da vaga</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título da vaga *</Label>
              <Input id="titulo" required value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Desenvolvedor React Sênior" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cargo *</Label>
                <Select required value={form.cargo} onChange={(e) => set("cargo", e.target.value)}>
                  <option value="">Selecione</option>
                  {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Modalidade *</Label>
                <Select required value={form.modalidade} onChange={(e) => set("modalidade", e.target.value)}>
                  <option value="">Selecione</option>
                  {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nível *</Label>
                <Select required value={form.nivel} onChange={(e) => set("nivel", e.target.value)}>
                  <option value="">Selecione</option>
                  {NIVEIS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contrato *</Label>
                <Select required value={form.tipoContrato} onChange={(e) => set("tipoContrato", e.target.value)}>
                  <option value="">Selecione</option>
                  {CONTRATOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="São Paulo" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input id="estado" maxLength={2} value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} placeholder="SP" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salarioMin">Salário mínimo (R$)</Label>
                <Input id="salarioMin" type="number" min={0} value={form.salarioMin} onChange={(e) => set("salarioMin", e.target.value)} placeholder="8000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salarioMax">Salário máximo (R$)</Label>
                <Input id="salarioMax" type="number" min={0} value={form.salarioMax} onChange={(e) => set("salarioMax", e.target.value)} placeholder="14000" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tecnologias</Label>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTech}
                placeholder="Digite e pressione Enter ou vírgula para adicionar"
              />
              {tecnologias.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tecnologias.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button type="button" onClick={() => setTecnologias((prev) => prev.filter((x) => x !== t))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição da vaga *</Label>
              <Textarea
                id="descricao"
                required
                minLength={50}
                rows={8}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Descreva as responsabilidades, requisitos e diferenciais da vaga..."
              />
              <p className="text-xs text-muted-foreground">Mínimo 50 caracteres. Quanto mais detalhada, melhor a qualidade dos candidatos.</p>
            </div>
          </CardContent>
        </Card>

        {erro && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
          ) : (
            "Ir para pagamento — R$297"
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Você será redirecionado ao Mercado Pago. Após o pagamento, a vaga é publicada automaticamente.
        </p>
      </form>
    </div>
  );
}
