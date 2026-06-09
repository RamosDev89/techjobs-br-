import { createHash } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

const TITLE_BADGES = /\s*(nova|new|hot|destaque|urgente|featured|exclusive|exclusiva)\s*$/i;

export function cleanTitulo(titulo: string): string {
  return titulo.replace(TITLE_BADGES, "").trim();
}

export function vagaHash(titulo: string, empresa: string, fonte: string): string {
  return sha256(`${cleanTitulo(titulo).toLowerCase()}|${empresa.toLowerCase().trim()}|${fonte}`);
}
