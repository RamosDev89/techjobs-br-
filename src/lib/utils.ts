import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  moeda = "BRL"
): string {
  if (!min && !max) return "A combinar";
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: moeda,
      maximumFractionDigits: 0,
    }).format(v);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `A partir de ${fmt(min)}`;
  return `Até ${fmt(max!)}`;
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

export function buildCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${prefix}:${sorted}`;
}
