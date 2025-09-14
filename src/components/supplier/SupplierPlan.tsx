import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SupplierPlan() {
  const { profile } = useAuth();
  
  const currentPlan = profile?.subscription_plan || 'gratuito';
  const isPro = currentPlan === 'pro';

  const features = {
    gratuito: [
      'Até 10 produtos cadastrados',
      'Perfil básico',
      'Chat básico com clientes',
      'Agenda simples'
    ],
    pro: [
      'Produtos ilimitados',
      'Perfil premium com destaque',
      'Chat avançado com clientes',
      'Agenda completa com lembretes',
      'Relatórios financeiros detalhados',
      'Suporte prioritário',
      'Analytics avançados'
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Plano</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e veja os recursos disponíveis
        </p>
      </div>

      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Plano Pro
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Plano Gratuito
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isPro 
                  ? 'Você tem acesso a todos os recursos premium'
                  : 'Você está usando o plano gratuito'
                }
              </CardDescription>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className="text-sm">
              {isPro ? 'PRO' : 'GRATUITO'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recursos inclusos:</h4>
              <ul className="space-y-2">
                {features[currentPlan].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Planos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plano Gratuito */}
        <Card className={`${!isPro ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Gratuito
            </CardTitle>
            <CardDescription>Ideal para começar</CardDescription>
            <div className="text-2xl font-bold">R$ 0<span className="text-sm font-normal">/mês</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {features.gratuito.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPro && (
              <Button variant="outline" className="w-full" disabled>
                Plano Atual
              </Button>
            )}
            {!isPro && (
              <Badge variant="default" className="w-full justify-center py-2">
                Plano Atual
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Plano Pro */}
        <Card className={`${isPro ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Pro
            </CardTitle>
            <CardDescription>Para fornecedores sérios</CardDescription>
            <div className="text-2xl font-bold">R$ 29,90<span className="text-sm font-normal">/mês</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPro && (
              <Badge variant="default" className="w-full justify-center py-2">
                Plano Atual
              </Badge>
            )}
            {!isPro && (
              <Button className="w-full">
                Fazer Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}