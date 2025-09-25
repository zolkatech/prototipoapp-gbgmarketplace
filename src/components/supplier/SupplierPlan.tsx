import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SupplierPlan() {
  const { profile } = useAuth();
  
  const currentPlan = profile?.subscription_plan || 'gratuito';
  const isPro = currentPlan === 'pro';

  const planFeatures = [
    {
      name: 'Cadastro e agenda',
      gratuito: true,
      pro: true
    },
    {
      name: 'Controle financeiro completo',
      gratuito: false,
      pro: true
    },
    {
      name: 'Vitrine e Feed',
      gratuito: true,
      pro: true
    },
    {
      name: 'Relatórios PDF',
      gratuito: false,
      pro: true
    },
    {
      name: 'Aparecer na busca de clientes',
      gratuito: false,
      pro: true
    }
  ];

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
      </Card>

      {/* Tabela de Comparação de Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Gratuito x Plano Pro</CardTitle>
          <CardDescription>Compare as funcionalidades disponíveis em cada plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2 font-medium">Funcionalidade</th>
                  <th className="text-center py-4 px-2 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <span>Gratuito</span>
                      <span className="text-sm font-normal text-muted-foreground">R$ 0/mês</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-2 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <span>Pro (mensalidade simbólica)</span>
                      <span className="text-sm font-normal text-muted-foreground">R$ 29,90/mês</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 px-2">{feature.name}</td>
                    <td className="py-4 px-2 text-center">
                      {feature.gratuito ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-2 text-center">
                      {feature.pro ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-center">
            {!isPro && (
              <Button size="lg" className="px-8">
                Fazer Upgrade para Pro
              </Button>
            )}
            {isPro && (
              <Badge variant="default" className="px-8 py-2 text-base">
                Você já é PRO!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}