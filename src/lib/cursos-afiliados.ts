const UTM = "?utm_source=techjobsbr&utm_medium=referral&utm_campaign=cursos";

export interface Curso {
  plataforma: string;
  nome: string;
  href: string;
}

// Mapa tech canônica → cursos. Trocar hrefs pelos links de afiliado reais quando cadastrar.
const CURSOS_POR_TECH: Record<string, Curso[]> = {
  React: [
    { plataforma: "Rocketseat", nome: "Ignite React", href: `https://www.rocketseat.com.br/ignite${UTM}` },
    { plataforma: "Alura", nome: "React com JavaScript", href: `https://www.alura.com.br/cursos-online-front-end/react${UTM}` },
  ],
  "React Native": [
    { plataforma: "Rocketseat", nome: "Ignite React Native", href: `https://www.rocketseat.com.br/ignite${UTM}` },
    { plataforma: "Alura", nome: "React Native com Expo", href: `https://www.alura.com.br/cursos-online-mobile/react-native${UTM}` },
  ],
  "Next.js": [
    { plataforma: "Rocketseat", nome: "Ignite Next.js", href: `https://www.rocketseat.com.br/ignite${UTM}` },
    { plataforma: "Alura", nome: "Next.js: tour pelo framework", href: `https://www.alura.com.br/cursos-online-front-end/next-js${UTM}` },
  ],
  Vue: [
    { plataforma: "Alura", nome: "Vue.js: construindo aplicações", href: `https://www.alura.com.br/cursos-online-front-end/vuejs${UTM}` },
  ],
  Angular: [
    { plataforma: "Alura", nome: "Angular: fundamentos", href: `https://www.alura.com.br/cursos-online-front-end/angular${UTM}` },
    { plataforma: "DIO", nome: "Angular Developer", href: `https://www.dio.me/bootcamp/angular-developer${UTM}` },
  ],
  TypeScript: [
    { plataforma: "Rocketseat", nome: "TypeScript no Ignite", href: `https://www.rocketseat.com.br/ignite${UTM}` },
    { plataforma: "Alura", nome: "TypeScript parte 1 e 2", href: `https://www.alura.com.br/cursos-online-front-end/typescript${UTM}` },
  ],
  JavaScript: [
    { plataforma: "Rocketseat", nome: "Discover — JavaScript", href: `https://www.rocketseat.com.br/discover${UTM}` },
    { plataforma: "Alura", nome: "JavaScript para Web", href: `https://www.alura.com.br/cursos-online-front-end/javascript${UTM}` },
  ],
  "Node.js": [
    { plataforma: "Rocketseat", nome: "Ignite Node.js", href: `https://www.rocketseat.com.br/ignite${UTM}` },
    { plataforma: "Alura", nome: "Node.js: criando API com Express", href: `https://www.alura.com.br/cursos-online-programacao/nodejs${UTM}` },
  ],
  Python: [
    { plataforma: "Alura", nome: "Python: primeiros passos", href: `https://www.alura.com.br/cursos-online-data-science/python${UTM}` },
    { plataforma: "DIO", nome: "Python AI Backend Developer", href: `https://www.dio.me/bootcamp/coding-the-future-vivo-python-ai-backend-developer${UTM}` },
  ],
  Java: [
    { plataforma: "Alura", nome: "Java: POO e desenvolvimento", href: `https://www.alura.com.br/cursos-online-programacao/java${UTM}` },
    { plataforma: "DIO", nome: "Java Developer", href: `https://www.dio.me/bootcamp/santander-2024-backend-com-java${UTM}` },
  ],
  Spring: [
    { plataforma: "Alura", nome: "Spring Boot: API REST", href: `https://www.alura.com.br/cursos-online-programacao/spring-framework${UTM}` },
  ],
  Kotlin: [
    { plataforma: "Alura", nome: "Kotlin: primeiros passos", href: `https://www.alura.com.br/cursos-online-mobile/kotlin${UTM}` },
    { plataforma: "DIO", nome: "Kotlin Developer", href: `https://www.dio.me/bootcamp/kotlin-developer${UTM}` },
  ],
  Flutter: [
    { plataforma: "Alura", nome: "Flutter: widgets e layouts", href: `https://www.alura.com.br/cursos-online-mobile/flutter${UTM}` },
  ],
  Go: [
    { plataforma: "Alura", nome: "Go: fundamentos da linguagem", href: `https://www.alura.com.br/cursos-online-programacao/golang${UTM}` },
  ],
  PHP: [
    { plataforma: "Alura", nome: "PHP: composição e reutilização de código", href: `https://www.alura.com.br/cursos-online-programacao/php${UTM}` },
  ],
  Laravel: [
    { plataforma: "Alura", nome: "Laravel: construindo uma aplicação", href: `https://www.alura.com.br/cursos-online-programacao/laravel${UTM}` },
  ],
  Django: [
    { plataforma: "Alura", nome: "Django: templates e boas práticas", href: `https://www.alura.com.br/cursos-online-programacao/django${UTM}` },
  ],
  ".NET": [
    { plataforma: "Alura", nome: ".NET: criando web API", href: `https://www.alura.com.br/cursos-online-programacao/net${UTM}` },
    { plataforma: "DIO", nome: ".NET Developer", href: `https://www.dio.me/bootcamp/bradesco-net-developer${UTM}` },
  ],
  AWS: [
    { plataforma: "Alura", nome: "AWS: computação em nuvem", href: `https://www.alura.com.br/cursos-online-devops/amazon-web-services${UTM}` },
    { plataforma: "DIO", nome: "Cloud AWS", href: `https://www.dio.me/bootcamp/cloud-aws${UTM}` },
  ],
  Docker: [
    { plataforma: "Alura", nome: "Docker: criando containers", href: `https://www.alura.com.br/cursos-online-devops/docker${UTM}` },
  ],
  Kubernetes: [
    { plataforma: "Alura", nome: "Kubernetes: orquestrando containers", href: `https://www.alura.com.br/cursos-online-devops/kubernetes${UTM}` },
  ],
  PostgreSQL: [
    { plataforma: "Alura", nome: "PostgreSQL: primeiros passos", href: `https://www.alura.com.br/cursos-online-data-science/postgresql${UTM}` },
  ],
};

/**
 * Dada lista de techs da vaga, retorna até 3 cursos.
 * Prioriza primeira tech que tiver cursos; faz dedup por href.
 */
export function getCursosParaTech(techs: string[]): Curso[] {
  const seen = new Set<string>();
  const result: Curso[] = [];

  for (const tech of techs) {
    const cursos = CURSOS_POR_TECH[tech];
    if (!cursos) continue;
    for (const c of cursos) {
      if (!seen.has(c.href) && result.length < 3) {
        seen.add(c.href);
        result.push(c);
      }
    }
    if (result.length >= 3) break;
  }

  return result;
}
