# TechJobs BR

Agregador de vagas de tecnologia do mercado brasileiro. Consolida oportunidades de múltiplas fontes em uma interface unificada, com mais de 1.000 vagas indexadas e infraestrutura completa de SEO.

🔗 **[techjobs-br.vercel.app](https://techjobs-br.vercel.app)**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| ORM | Prisma ORM |
| Banco de dados | PostgreSQL (Supabase) |
| Scraping | Playwright + scripts Node.js |
| Testes | Vitest |
| Deploy | Vercel |

---

## Funcionalidades

- **Agregação multi-fonte** — coleta de vagas do GeekHunter, Indeed, Glassdoor e outras plataformas via scrapers com Playwright
- **+1.000 vagas indexadas** com deduplicação por URL de origem
- **SEO estruturado** — sitemap dinâmico, integração com Google Search Console e schema markup `JobPosting` (JSON-LD) por vaga
- **Filtragem** por tecnologia, localização e regime de trabalho
- **Interface responsiva** com Tailwind CSS

---

## Arquitetura

```
techjobs-br/
├── src/
│   ├── app/              # App Router (Next.js 14)
│   │   ├── page.tsx      # Listagem de vagas com filtros
│   │   ├── vagas/[id]/   # Página individual da vaga (SEO + JSON-LD)
│   │   └── sitemap.ts    # Sitemap dinâmico gerado via Prisma
│   ├── components/       # Componentes React reutilizáveis
│   └── lib/              # Prisma client, utilitários
├── prisma/
│   └── schema.prisma     # Modelagem do banco de dados
└── scripts/              # Scrapers por fonte de vagas
```

### Fluxo de dados

```
Scraper (Playwright) → PostgreSQL (Supabase via Prisma) → API Route → Interface Next.js
```

Os scrapers rodam de forma independente do servidor Next.js, gravando diretamente no banco via Prisma. O frontend consome os dados via API Routes com cache controlado.

---

## Modelo de dados (simplificado)

```prisma
model Job {
  id          String   @id @default(cuid())
  title       String
  company     String
  location    String?
  type        String?  // CLT, PJ, Remoto
  url         String   @unique
  source      String   // geekhunter | indeed | glassdoor
  techs       String[]
  postedAt    DateTime?
  createdAt   DateTime @default(now())
}
```

O campo `url` como `@unique` é a principal estratégia de deduplicação — scrapers podem rodar múltiplas vezes sem duplicar registros.

---

## Decisões técnicas

**Por que Next.js App Router e não Pages Router?**
O App Router permite Server Components por padrão, o que reduz o JavaScript enviado ao cliente e melhora o Time to First Byte — crítico para SEO em páginas de listagem com muitos itens.

**Por que Prisma + Supabase e não Firestore ou outro NoSQL?**
Vagas de emprego têm estrutura relacional previsível (empresa, localização, tecnologias, fonte). SQL permite queries complexas de filtragem e agregação sem overhead de modelagem adicional. O Supabase oferece PostgreSQL gerenciado com tier gratuito suficiente para o volume atual.

**Por que scrapers manuais e não cron job?**
Na fase atual, o volume de fontes e a variação de layout entre plataformas torna mais seguro rodar os scrapers manualmente com supervisão. A arquitetura já suporta automação via cron (Vercel Cron Jobs ou GitHub Actions) sem mudança estrutural.

**Por que Playwright para scraping?**
Plataformas como Indeed e Glassdoor renderizam conteúdo via JavaScript — scrapers baseados em fetch simples não funcionam. O Playwright executa um browser real, garantindo acesso ao DOM renderizado.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta no Supabase)

### Instalação

```bash
git clone https://github.com/RamosDev89/techjobs-br-.git
cd techjobs-br-

npm install
```

### Configuração de ambiente

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
DATABASE_URL=postgresql://...   # String de conexão do Supabase
```

### Banco de dados

```bash
npx prisma migrate dev     # Aplica migrações
npx prisma generate        # Gera o Prisma Client
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Executar scrapers

```bash
node scripts/scraper-geekhunter.js
node scripts/scraper-indeed.js
# ... por fonte
```

Os scrapers gravam diretamente no banco configurado no `.env.local`.

---

## Testes

```bash
npm run test        # Vitest (testes unitários)
npm run test:e2e    # Playwright (testes end-to-end)
```

---

## Deploy

O projeto faz deploy automático na Vercel a cada push na branch `main`.

Variáveis de ambiente necessárias na Vercel:
- `DATABASE_URL` — string de conexão do Supabase

---

## Roadmap

- [ ] Cron job automatizado para execução dos scrapers (GitHub Actions)
- [ ] Alertas de novas vagas por e-mail ou webhook
- [ ] Página de empresa com histórico de vagas
- [ ] API pública para consumo externo
- [ ] Dashboard de métricas (vagas por tecnologia, por cidade, por fonte)

---

## Autor

**Fernando Rafael Ramos**
Desenvolvedor Full Stack | Curitiba, BR

[LinkedIn](https://linkedin.com/in/fernandorramos) · [GitHub](https://github.com/RamosDev89) · [Portfólio](https://ramosfrdev.com.br)
