
import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

type Expense = {
  id: string;
  supplier_id: string;
  category: 'combustivel_deslocamento' | 'material' | 'alimentacao' | 'impostos' | 'outros';
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
};

const categoryLabels: Record<Expense['category'], string> = {
  combustivel_deslocamento: 'Combustível/Deslocamento',
  material: 'Material utilizado',
  alimentacao: 'Alimentação',
  impostos: 'Impostos',
  outros: 'Outros',
};

type Props = {
  supplierId: string;
  expenses: Expense[];
  onRefresh: () => void;
};

export default function ExpensesSection({ supplierId, expenses, onRefresh }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '' as Expense['category'] | '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    if (!form.category || !form.amount) {
      toast({ title: 'Preencha categoria e valor', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('expenses').insert({
      supplier_id: supplierId,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description || null,
      expense_date: new Date(form.expense_date + 'T00:00:00Z').toISOString(),
    } as any);
    setLoading(false);

    if (error) {
      console.error(error);
      toast({ title: 'Erro ao adicionar despesa', variant: 'destructive' });
      return;
    }

    toast({ title: 'Despesa adicionada!' });
    setForm({ category: '', amount: '', description: '', expense_date: new Date().toISOString().slice(0, 10) });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast({ title: 'Erro ao deletar despesa', variant: 'destructive' });
    } else {
      toast({ title: 'Despesa deletada' });
      onRefresh();
    }
  };

  const monthTotal = useMemo(() => {
    return expenses.reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas</CardTitle>
        <CardDescription>Registre e acompanhe seus custos por categoria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as Expense['category'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combustivel_deslocamento">{categoryLabels.combustivel_deslocamento}</SelectItem>
                <SelectItem value="material">{categoryLabels.material}</SelectItem>
                <SelectItem value="alimentacao">{categoryLabels.alimentacao}</SelectItem>
                <SelectItem value="impostos">{categoryLabels.impostos}</SelectItem>
                <SelectItem value="outros">{categoryLabels.outros}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
            />
          </div>
          <div className="space-y-2 md:col-span-4">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex: combustível viagem Cliente X"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={loading || !form.category || !form.amount} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Despesa
            </Button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">Total no mês: R$ {monthTotal.toFixed(2)}</div>
        </div>

        <div className="space-y-3">
          {expenses.length ? (
            expenses.slice(0, 20).map((e) => (
              <div key={e.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{categoryLabels[e.category]}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(e.expense_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {e.description && <div className="text-sm mt-1">{e.description}</div>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-medium">R$ {Number(e.amount).toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(e.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">Nenhuma despesa registrada</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

