import type { ScrapedVaga } from "@/types";

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
