import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ pedidoId?: string; pendente?: string }>;
}

export default async function AnuncieSuccessPage({ searchParams }: Props) {
  const { pendente } = await searchParams;
  const isPendente = pendente === "true";

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="flex justify-center mb-6">
        {isPendente ? (
          <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-3">
        {isPendente ? "Pagamento em análise" : "Vaga publicada com sucesso!"}
      </h1>

      <Card className="mb-8">
        <CardContent className="p-6 text-sm text-muted-foreground text-left space-y-3">
          {isPendente ? (
            <>
              <p>Seu pagamento está sendo processado. Isso pode levar alguns minutos.</p>
              <p>Assim que confirmado, sua vaga será publicada automaticamente e aparecerá em destaque na listagem.</p>
              <p>Você não precisa fazer nada — o processo é automático.</p>
            </>
          ) : (
            <>
              <p>Sua vaga está publicada e já aparece em destaque no TechJobs BR.</p>
              <p>Ela ficará em destaque por <strong>30 dias</strong> e será exibida no topo da listagem e na homepage.</p>
              <p>Profissionais cadastrados nos alertas de email também receberão notificação sobre a nova oportunidade.</p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/vagas">
            Ver listagem de vagas <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/anuncie/publicar">Publicar outra vaga</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Dúvidas? Entre em contato pelo email da sua confirmação de pagamento do Mercado Pago.
      </p>
    </div>
  );
}
