import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

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
  selectedMonth: string; // YYYY-MM format
};

export default function ReportsSection({ sales, expenses, taxRate, selectedMonth }: Props) {
  const entradas = sales.reduce((s, v) => s + Number(v.sale_value), 0);
  const custosVendas = sales.reduce((s, v) => s + (Number(v.sale_value) - Number(v.profit || 0)), 0);
  const despesas = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const impostos = (entradas * (taxRate || 0)) / 100;
  const saidas = custosVendas + despesas + impostos;
  const saldo = entradas - saidas;

  const generateMonthlyPDF = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthName = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) return;
    
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
        h1, h2 { margin: 0 0 16px 0; color: #1a1a1a; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }
        .summary-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: #f9f9f9; }
        .summary-title { font-size: 12px; color: #666; margin-bottom: 8px; }
        .summary-value { font-size: 20px; font-weight: bold; color: #1a1a1a; }
        .highlight { background: #e8f5e8; border-color: #c8e6c9; }
        .muted { color: #666; font-size: 12px; margin-top: 16px; }
      </style>
    `;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - ${monthName}</title>
          ${style}
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <h2>${monthName}</h2>
          <div class="muted">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
          
          <div class="summary-grid">
            <div class="summary-card highlight">
              <div class="summary-title">Entradas</div>
              <div class="summary-value">R$ ${entradas.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Custos das Vendas</div>
              <div class="summary-value">R$ ${custosVendas.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Despesas</div>
              <div class="summary-value">R$ ${despesas.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Impostos</div>
              <div class="summary-value">R$ ${impostos.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Total de Saídas</div>
              <div class="summary-value">R$ ${saidas.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card highlight">
              <div class="summary-title">Saldo Final</div>
              <div class="summary-value" style="color: ${saldo >= 0 ? '#2e7d32' : '#d32f2f'};">R$ ${saldo.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    w.document.write(html);
    w.document.close();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Resumo do mês</CardTitle>
          <CardDescription>Entradas x Saídas de forma simples</CardDescription>
        </div>
        <Button onClick={generateMonthlyPDF} variant="outline" size="sm">
          <FileDown className="w-4 h-4 mr-2" />
          Gerar PDF
        </Button>
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
