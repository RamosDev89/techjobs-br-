"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Briefcase, FileText, Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { User } from "@supabase/supabase-js";

interface DashStats {
  candidaturas: number;
  alertas: number;
  vagas: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    Promise.all([
      fetch("/api/candidaturas").then((r) => r.json()),
      fetch("/api/alertas").then((r) => r.json()),
    ])
      .then(([candidaturas, alertas]) => {
        setStats({
          candidaturas: Array.isArray(candidaturas) ? candidaturas.length : 0,
          alertas: Array.isArray(alertas) ? alertas.length : 0,
          vagas: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const nome = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "usuário";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, {nome} 👋</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu painel</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.candidaturas ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Candidaturas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.alertas ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Alertas ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.vagas ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Vagas publicadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Candidaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acompanhe o status de todas as suas candidaturas.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/candidaturas">Ver candidaturas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-primary" />
              Alertas de vagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure alertas e receba vagas por email a cada 6 horas.
            </p>
            <Button size="sm" asChild>
              <Link href="/vagas">
                <Plus className="h-4 w-4" />
                Criar alerta
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5 text-primary" />
              Publicar vaga
              <Badge variant="secondary">Empresa</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Publique vagas na plataforma e alcance candidatos qualificados.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/vagas">
                <Plus className="h-4 w-4" />
                Nova vaga
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
