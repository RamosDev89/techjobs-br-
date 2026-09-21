import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/40 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              TechJobs <span className="text-primary">BR</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agregador de vagas de tecnologia no Brasil. Encontre sua próxima oportunidade.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm">Para Candidatos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vagas" className="hover:text-primary transition-colors">Buscar Vagas</Link></li>
              <li><Link href="/cadastro" className="hover:text-primary transition-colors">Criar Conta</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Minhas Candidaturas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm">Para Empresas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/anuncie" className="hover:text-primary transition-colors">Publicar Vaga</Link></li>
              <li><Link href="/precos" className="hover:text-primary transition-colors">Planos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm">Empresa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link href="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
              <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground space-y-1">
          <p>© {new Date().getFullYear()} TechJobs BR. Todos os direitos reservados.</p>
          <p>Desenvolvido por{" "}
            <a
              href="https://www.linkedin.com/in/fernandorramos/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              Fernando Rafael Ramos
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
