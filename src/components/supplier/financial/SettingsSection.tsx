
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  supplierId: string;
  initialTaxRate: number;
  onSaved: (taxRate: number) => void;
};

export default function SettingsSection({ supplierId, initialTaxRate, onSaved }: Props) {
  const { toast } = useToast();
  const [taxRate, setTaxRate] = useState<number>(initialTaxRate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTaxRate(initialTaxRate);
  }, [initialTaxRate]);

  const save = async () => {
    if (!supplierId) return;
    setLoading(true);
    const { error } = await supabase
      .from('supplier_financial_settings')
      .upsert({ supplier_id: supplierId, tax_rate: taxRate }, { onConflict: 'supplier_id' } as any);
    setLoading(false);
    if (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } else {
      toast({ title: 'Configuração salva!' });
      onSaved(taxRate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>Defina a porcentagem de impostos para cálculo automático nos relatórios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Impostos (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value || '0'))}
            />
          </div>
          <div>
            <Button onClick={save} disabled={loading} className="w-full md:w-auto">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Observação: Os impostos são aplicados como % sobre a receita do período nos relatórios.
        </div>
      </CardContent>
    </Card>
  );
}

