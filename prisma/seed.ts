import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed empresas
  const empresas = [
    { nome: "Nubank", slug: "nubank", site: "https://nubank.com.br", tamanho: "ENTERPRISE" as const, verificada: true, localizacao: "São Paulo, SP" },
    { nome: "iFood", slug: "ifood", site: "https://ifood.com.br", tamanho: "GRANDE" as const, verificada: true, localizacao: "São Paulo, SP" },
    { nome: "Hotmart", slug: "hotmart", site: "https://hotmart.com", tamanho: "GRANDE" as const, verificada: true, localizacao: "Belo Horizonte, MG" },
    { nome: "Conta Azul", slug: "conta-azul", site: "https://contaazul.com", tamanho: "PME" as const, verificada: true, localizacao: "Joinville, SC" },
    { nome: "RD Station", slug: "rd-station", site: "https://rdstation.com", tamanho: "GRANDE" as const, verificada: true, localizacao: "Florianópolis, SC" },
  ];

  for (const e of empresas) {
    await prisma.empresa.upsert({
      where: { slug: e.slug },
      create: e,
      update: {},
    });
  }

  const nubank = await prisma.empresa.findUnique({ where: { slug: "nubank" } });
  const ifood = await prisma.empresa.findUnique({ where: { slug: "ifood" } });
  const hotmart = await prisma.empresa.findUnique({ where: { slug: "hotmart" } });

  if (!nubank || !ifood || !hotmart) throw new Error("Empresas não encontradas");

  // Seed vagas
  const vagas = [
    {
      titulo: "Engenheiro de Software Sênior — Backend",
      slug: "engenheiro-software-senior-backend-nubank",
      descricao: "Procuramos um engenheiro de backend sênior para trabalhar no core do nosso sistema de pagamentos. Você irá projetar e implementar APIs de alta disponibilidade, contribuir para arquitetura de microsserviços e mentorear desenvolvedores júniores.\n\nRequisitos:\n- 5+ anos de experiência com Kotlin ou Clojure\n- Experiência com sistemas distribuídos\n- Conhecimento em DDD e arquitetura de microsserviços\n- PostgreSQL e experiência com bancos NoSQL",
      empresaId: nubank.id,
      modalidade: "REMOTA" as const,
      nivel: "SENIOR" as const,
      cargo: "BACKEND" as const,
      tipoContrato: "CLT" as const,
      salarioMin: 25000,
      salarioMax: 40000,
      estado: "SP",
      cidade: "São Paulo",
      tecnologias: ["Kotlin", "Clojure", "PostgreSQL", "Kubernetes", "AWS"],
      beneficios: ["Vale refeição", "Plano de saúde", "Stock options", "Gympass"],
      destacada: true,
    },
    {
      titulo: "Desenvolvedor Frontend React",
      slug: "desenvolvedor-frontend-react-ifood",
      descricao: "Buscamos um desenvolvedor frontend para compor nosso time de produto. Você trabalhará na evolução de componentes e features do nosso app web, com foco em performance e experiência do usuário.\n\nRequisitos:\n- 3+ anos com React\n- TypeScript\n- Testes com Jest/Testing Library\n- Experiência com design systems",
      empresaId: ifood.id,
      modalidade: "HIBRIDA" as const,
      nivel: "PLENO" as const,
      cargo: "FRONTEND" as const,
      tipoContrato: "CLT" as const,
      salarioMin: 12000,
      salarioMax: 18000,
      estado: "SP",
      cidade: "São Paulo",
      tecnologias: ["React", "TypeScript", "Next.js", "Jest", "Tailwind"],
      beneficios: ["Vale refeição", "Plano de saúde", "iFood Benefícios"],
      destacada: true,
    },
    {
      titulo: "Desenvolvedor Mobile React Native",
      slug: "dev-mobile-react-native-hotmart",
      descricao: "Oportunidade para desenvolvedor mobile com foco em React Native. Você fará parte do time responsável pelos aplicativos Hotmart em iOS e Android.\n\nRequisitos:\n- 2+ anos com React Native\n- Conhecimento em TypeScript\n- Publicação de apps na App Store e Play Store",
      empresaId: hotmart.id,
      modalidade: "REMOTA" as const,
      nivel: "PLENO" as const,
      cargo: "MOBILE" as const,
      tipoContrato: "PJ" as const,
      salarioMin: 10000,
      salarioMax: 15000,
      estado: "MG",
      cidade: "Belo Horizonte",
      tecnologias: ["React Native", "TypeScript", "iOS", "Android"],
      beneficios: ["Plano de saúde", "Vale refeição"],
      destacada: false,
    },
  ];

  for (const vaga of vagas) {
    const exists = await prisma.vaga.findUnique({ where: { slug: vaga.slug } });
    if (!exists) {
      await prisma.vaga.create({ data: { ...vaga, beneficios: vaga.beneficios } });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
