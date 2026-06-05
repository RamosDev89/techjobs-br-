import type {
  Cargo,
  Modalidade,
  Nivel,
  TipoContrato,
  Moeda,
  TamanhoEmpresa,
  StatusCandidatura,
} from "@prisma/client";

export type { Cargo, Modalidade, Nivel, TipoContrato, Moeda, TamanhoEmpresa, StatusCandidatura };

export interface VagaFiltrosType {
  q?: string;
  cargo?: Cargo;
  modalidade?: Modalidade;
  nivel?: Nivel;
  tipoContrato?: TipoContrato;
  estado?: string;
  cidade?: string;
  salarioMin?: number;
  tecnologias?: string[];
  fonte?: string;
  page?: number;
  limit?: number;
}

export interface VagaComEmpresa {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  modalidade: Modalidade;
  nivel: Nivel;
  cargo: Cargo;
  tipoContrato: TipoContrato;
  salarioMin: number | null;
  salarioMax: number | null;
  moeda: Moeda;
  estado: string | null;
  cidade: string | null;
  tecnologias: string[];
  beneficios: string[];
  ativa: boolean;
  destacada: boolean;
  visualizacoes: number;
  expiradaEm: Date | null;
  fonteExterna: string | null;
  nomeFonte: string | null;
  criadaEm: Date;
  atualizadaEm: Date;
  empresa: {
    id: string;
    nome: string;
    slug: string;
    logo: string | null;
    tamanho: TamanhoEmpresa;
    localizacao: string | null;
    verificada: boolean;
  };
}

export interface ScrapedVaga {
  titulo: string;
  descricao: string;
  empresaNome: string;
  empresaSite?: string;
  modalidade: Modalidade;
  nivel: Nivel;
  cargo: Cargo;
  tipoContrato: TipoContrato;
  salarioMin?: number;
  salarioMax?: number;
  estado?: string;
  cidade?: string;
  tecnologias: string[];
  fonteExterna: string;
  nomeFonte: string;
  publicadaEm?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
