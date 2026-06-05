import { createHash } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function vagaHash(titulo: string, empresa: string, fonte: string): string {
  return sha256(`${titulo.toLowerCase().trim()}|${empresa.toLowerCase().trim()}|${fonte}`);
}
