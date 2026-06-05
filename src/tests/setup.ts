// Global test setup
import { vi } from "vitest";

// Mock Prisma in tests
vi.mock("@/lib/prisma", () => ({
  prisma: {
    vaga: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    empresa: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
  },
  default: {},
}));

// Mock Redis
vi.mock("@/lib/redis", () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  cacheDel: vi.fn().mockResolvedValue(undefined),
}));
