import { describe, it, expect } from "vitest";
import { slugify, formatSalary, timeAgo, buildCacheKey } from "@/lib/utils";

describe("slugify", () => {
  it("converts to lowercase with hyphens", () => {
    expect(slugify("Desenvolvedor React Sênior")).toBe("desenvolvedor-react-senior");
  });

  it("removes special characters", () => {
    expect(slugify("Full-Stack Dev (BR)")).toBe("full-stack-dev-br");
  });
});

describe("formatSalary", () => {
  it("returns A combinar when no values", () => {
    expect(formatSalary()).toBe("A combinar");
  });

  it("formats range", () => {
    const result = formatSalary(8000, 15000);
    expect(result).toContain("8");
    expect(result).toContain("15");
  });

  it("formats min only", () => {
    const result = formatSalary(8000, null);
    expect(result).toContain("partir de");
  });
});

describe("buildCacheKey", () => {
  it("generates deterministic key", () => {
    const k1 = buildCacheKey("vagas", { page: 1, cargo: "FRONTEND" });
    const k2 = buildCacheKey("vagas", { cargo: "FRONTEND", page: 1 });
    expect(k1).toBe(k2);
  });
});

describe("vagaHash", () => {
  it("same inputs produce same hash", async () => {
    const { vagaHash } = await import("@/lib/hash");
    const h1 = vagaHash("Dev React", "Empresa X", "Gupy");
    const h2 = vagaHash("Dev React", "Empresa X", "Gupy");
    expect(h1).toBe(h2);
  });

  it("different inputs produce different hash", async () => {
    const { vagaHash } = await import("@/lib/hash");
    const h1 = vagaHash("Dev React", "Empresa X", "Gupy");
    const h2 = vagaHash("Dev React", "Empresa Y", "Gupy");
    expect(h1).not.toBe(h2);
  });
});
