import type { ScrapedVaga } from "@/types";

type Cargo = ScrapedVaga["cargo"];

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Rules ordered by specificity — first match wins
const ROLE_RULES: Array<[string[], Cargo]> = [
  // FRONTEND
  [["desenvolvedor frontend", "desenvolvedora frontend",
    "developer frontend", "frontend developer", "frontend engineer",
    "front end developer", "front-end developer",
    "engenheiro frontend", "engenheiro front-end",
    "desenvolvedor react", "react developer", "react engineer", "dev react",
    "desenvolvedor vue", "vue developer", "vue.js developer",
    "desenvolvedor angular", "angular developer",
    "desenvolvedor svelte", "svelte developer",
    "desenvolvedor next.js", "nextjs developer",
    "desenvolvedor typescript", "typescript developer",
  ], "FRONTEND"],

  // BACKEND
  [["desenvolvedor backend", "desenvolvedora backend",
    "developer backend", "backend developer", "backend engineer",
    "back end developer", "back-end developer",
    "engenheiro backend", "engenheiro back-end",
    "desenvolvedor node", "nodejs developer", "node.js developer",
    "desenvolvedor python", "python developer", "python engineer",
    "desenvolvedor java ", "java developer", "java engineer",
    "desenvolvedor php", "php developer", "php engineer",
    "desenvolvedor .net", ".net developer", ".net engineer",
    "desenvolvedor c#", "c# developer", "c# engineer",
    "desenvolvedor ruby", "ruby developer", "ruby on rails",
    "desenvolvedor go ", "golang developer", "go developer",
    "desenvolvedor rust", "rust developer",
    "desenvolvedor elixir", "elixir developer",
    "desenvolvedor scala", "scala developer",
    "desenvolvedor kotlin", "kotlin developer",
    "desenvolvedor spring", "spring developer",
    "desenvolvedor django", "django developer",
    "desenvolvedor laravel", "laravel developer",
    "desenvolvedor api", "api developer",
    "desenvolvedor abap", "abap developer",
    "desenvolvedor sharepoint", "sharepoint developer",
    "desenvolvedor salesforce", "salesforce developer",
  ], "BACKEND"],

  // MOBILE
  [["desenvolvedor mobile", "mobile developer", "mobile engineer",
    "engenheiro mobile",
    "desenvolvedor ios", "ios developer", "ios engineer",
    "desenvolvedor android", "android developer", "android engineer",
    "desenvolvedor flutter", "flutter developer", "flutter engineer",
    "desenvolvedor react native", "react native developer",
    "desenvolvedor swift", "swift developer",
  ], "MOBILE"],

  // FULLSTACK
  [["desenvolvedor full stack", "desenvolvedora full stack",
    "desenvolvedor fullstack", "desenvolvedor full-stack",
    "full stack developer", "fullstack developer", "full-stack developer",
    "full stack engineer", "fullstack engineer",
    "engenheiro full stack", "engenheiro fullstack",
    "desenvolvedor web ", "web developer", "web engineer",
    "desenvolvedor web e mobile",
  ], "FULLSTACK"],

  // DATA
  [["cientista de dados", "data scientist",
    "analista de dados", "data analyst",
    "engenheiro de dados", "data engineer",
    "analista de bi", "bi analyst", "bi developer",
    "analista bi", "analista de business intelligence",
    "business intelligence developer", "bi developer",
    "analytics engineer", "analytics developer",
    "engenheiro de analytics",
  ], "DATA"],

  // IA
  [["engenheiro de machine learning", "machine learning engineer", "ml engineer",
    "especialista em inteligencia artificial", "especialista em ia",
    "ai engineer", "ai specialist", "engenheiro de ia",
    "llm engineer", "nlp engineer", "nlp developer",
    "computer vision engineer", "engenheiro de nlp",
    "deep learning engineer", "deep learning researcher",
    "ai researcher", "pesquisador de ia",
  ], "IA"],

  // DEVOPS
  [["devops engineer", "engenheiro devops", "engenheiro de devops",
    "engenheiro de infraestrutura", "infrastructure engineer",
    "site reliability engineer", "reliability engineer",
    "administrador de sistemas", "sysadmin", "systems administrator",
    "administrador de banco de dados", "database administrator",
    " dba ", "administrador dba",
    "engenheiro cloud", "cloud engineer", "cloud architect",
    "arquiteto cloud", "arquiteto de nuvem",
    "arquiteto de solucoes", "solutions architect",
    "platform engineer", "engenheiro de plataforma",
    "engenheiro de redes", "network engineer",
    "administrador de redes", "network administrator",
    "engenheiro de confiabilidade",
    "kubernetes engineer", "devsecops",
  ], "DEVOPS"],

  // SEGURANCA
  [["analista de seguranca da informacao",
    "analista de seguranca", "security analyst",
    "engenheiro de seguranca", "security engineer",
    "pentester", "pen tester", "analista de pentest",
    "especialista em seguranca", "cybersecurity engineer",
    "analista de ciberseguranca", "cybersecurity analyst",
    "analista de infosec", "information security analyst",
  ], "SEGURANCA"],

  // DESIGN
  [["ux designer", "ui designer", "ux/ui designer",
    "uiux designer", "ui/ux designer",
    "product designer", "designer de produto",
    "web designer", "interaction designer",
    "experience designer", "visual designer",
    "designer de interfaces",
  ], "DESIGN"],

  // PRODUTO
  [["product manager", "gerente de produto", "gerente de produtos",
    "product owner", "head of product", "vp of product",
    "vp de produto", "diretor de produto", "product lead",
  ], "PRODUTO"],

  // QA
  [["qa engineer", "quality assurance engineer",
    "analista de qa", "qa analyst", "analista de qualidade",
    "quality analyst", "quality engineer",
    "software tester", "engenheiro de qualidade",
    "engenheiro de testes", "analista de testes",
  ], "QA"],

  // OUTRO — tech roles that don't fit above
  [["scrum master", "agile coach", "agile master",
    "tech lead", "technical lead", "lider tecnico",
    "cto", "chief technology officer", "chief technical officer",
    "vp of engineering", "vp de engenharia",
    "head of engineering", "head de engenharia", "head de tecnologia",
    "diretor de tecnologia", "diretor de ti", "diretor de engenharia",
    "gerente de ti", "gerente de tecnologia", "gerente de engenharia",
    "coordenador de ti", "coordenador de tecnologia",
    "arquiteto de software", "software architect",
    "arquiteto de dados", "data architect",
    "analista de sistemas", "systems analyst",
    "analista de ti", "analista de tecnologia",
    "analista de suporte", "analista de infraestrutura",
    "analista programador", "analista desenvolvedor",
    "tecnico de ti", "tecnico de informatica", "tecnico de suporte",
    "suporte tecnico", "suporte de ti",
    "especialista em ti", "especialista em tecnologia",
    "consultor de ti", "consultor de tecnologia",
    "engenheiro de software", "software engineer",
    "programador", "programadora",
    "desenvolvedor", "desenvolvedora",
    "developer", " dev ",
  ], "OUTRO"],
];

const NORMALIZED_RULES: Array<[string[], Cargo]> = ROLE_RULES.map(
  ([patterns, cargo]) => [patterns.map(norm), cargo]
);

/**
 * Returns the Cargo category if the job title is tech-related, or null to reject.
 */
export function classifyTechJob(titulo: string): Cargo | null {
  const t = ` ${norm(titulo)} `;
  for (const [patterns, cargo] of NORMALIZED_RULES) {
    if (patterns.some((p) => t.includes(p))) return cargo;
  }
  return null;
}

export function guessCargo(title: string): ScrapedVaga["cargo"] {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("front-end") || t.includes("front end")) return "FRONTEND";
  if (t.includes("backend") || t.includes("back-end") || t.includes("back end")) return "BACKEND";
  if (t.includes("fullstack") || t.includes("full stack") || t.includes("full-stack")) return "FULLSTACK";
  if (t.includes("mobile") || t.includes("ios") || t.includes("android")) return "MOBILE";
  if (t.includes("devops") || t.includes("cloud") || t.includes("sre") || t.includes("infra")) return "DEVOPS";
  if (t.includes("data") || t.includes("analytics") || t.includes("machine learning") || t.includes("ml ")) return "DATA";
  if (t.includes("qa") || t.includes("test") || t.includes("qualidade") || t.includes("quality")) return "QA";
  if (t.includes("design") || t.includes("ux") || t.includes("ui ")) return "DESIGN";
  if (t.includes("product") || t.includes("produto") || t.includes("pm ")) return "PRODUTO";
  if (t.includes("security") || t.includes("segurança") || t.includes("ciberseg")) return "SEGURANCA";
  if (t.includes(" ia") || t.includes("inteligência artificial") || t.includes("llm") || t.includes("gpt")) return "IA";
  return "OUTRO";
}

export function guessNivel(title: string): ScrapedVaga["nivel"] {
  const t = title.toLowerCase();
  if (t.includes("estágio") || t.includes("estagio") || t.includes("intern")) return "ESTAGIO";
  if (t.includes("trainee")) return "TRAINEE";
  if (t.includes("júnior") || t.includes("junior") || t.includes("jr.") || t.includes(" jr ")) return "JUNIOR";
  if (t.includes("pleno") || t.includes("mid-level") || t.includes("mid level")) return "PLENO";
  if (t.includes("sênior") || t.includes("senior") || t.includes("sr.") || t.includes(" sr ")) return "SENIOR";
  if (t.includes("especialista") || t.includes("specialist") || t.includes("staff")) return "ESPECIALISTA";
  if (t.includes("gerente") || t.includes("manager") || t.includes("lead") || t.includes("head")) return "GERENCIA";
  return "PLENO";
}

export function extractTechs(text: string): string[] {
  const known = [
    "React", "Vue", "Angular", "Next.js", "Nuxt", "TypeScript", "JavaScript",
    "Python", "Java", "Go", "Golang", "Rust", "C#", ".NET", "Node.js",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL",
    "MongoDB", "Redis", "GraphQL", "REST", "Kotlin", "Swift", "Flutter",
    "React Native", "Terraform", "Linux", "Spring", "Django", "FastAPI",
    "Laravel", "PHP", "Ruby", "Rails", "Scala", "Elixir", "Clojure",
    "Prisma", "Supabase", "Firebase", "Tailwind", "SASS", "Webpack",
    "Vite", "Jest", "Cypress", "Playwright",
  ];
  return known.filter((t) =>
    new RegExp(`\\b${t.replace(".", "\\.").replace("+", "\\+")}\\b`, "i").test(text)
  );
}
