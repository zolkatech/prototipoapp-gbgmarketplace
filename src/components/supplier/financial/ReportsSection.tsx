import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Sale = {
  id: string;
  sale_value: number;
  profit: number;
  created_at: string;
};

type Expense = {
  id: string;
  amount: number;
  expense_date: string;
};

type Props = {
  sales: Sale[]; // já filtradas pelo mês
  expenses: Expense[]; // já filtradas pelo mês
  taxRate: number; // %
};

export default function ReportsSection({ sales, expenses, taxRate }: Props) {
  const entradas = sales.reduce((s, v) => s + Number(v.sale_value), 0);
  const custosVendas = sales.reduce((s, v) => s + (Number(v.sale_value) - Number(v.profit || 0)), 0);
  const despesas = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const impostos = (entradas * (taxRate || 0)) / 100;
  const saidas = custosVendas + despesas + impostos;
  const saldo = entradas - saidas;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do mês</CardTitle>
        <CardDescription>Entradas x Saídas de forma simples</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Summary title="Entradas" value={entradas} emphasis />
        <Summary title="Custos das vendas" value={custosVendas} />
        <Summary title="Despesas" value={despesas} />
        <Summary title="Impostos" value={impostos} />
        <Summary title="Saídas" value={saidas} />
        <Summary title="Saldo" value={saldo} emphasis />
      </CardContent>
    </Card>
  );
}

function Summary({ title, value, emphasis }: { title: string; value: number; emphasis?: boolean }) {
  return (
    <div className={`p-3 border rounded-lg ${emphasis ? 'bg-muted/30' : ''}`}>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">R$ {Number(value).toFixed(2)}</div>
    </div>
  );
}
