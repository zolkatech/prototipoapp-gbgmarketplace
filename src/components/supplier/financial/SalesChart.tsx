import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

type Sale = {
  id: string;
  sale_value: number;
  profit: number;
  created_at: string;
};

type Props = {
  sales: Sale[];
  selectedMonth: string;
};

export default function SalesChart({ sales, selectedMonth }: Props) {
  // Processar dados para o gráfico
  const processChartData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Inicializar array com todos os dias do mês
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      vendas: 0,
      valor: 0
    }));

    // Agrupar vendas por dia
    sales.forEach(sale => {
      const saleDate = new Date(sale.created_at);
      const day = saleDate.getDate();
      
      if (chartData[day - 1]) {
        chartData[day - 1].vendas += 1;
        chartData[day - 1].valor += Number(sale.sale_value);
      }
    });

    return chartData;
  };

  const chartData = processChartData();
  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, sale) => sum + Number(sale.sale_value), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Gráfico de Vendas
            </CardTitle>
            <CardDescription>
              Vendas do mês {selectedMonth}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{totalSales} vendas</p>
            <p className="text-sm text-primary font-medium">R$ {totalValue.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalSales > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">Dia {label}</p>
                        <p className="text-sm text-primary">
                          Vendas: {payload[0]?.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Valor: R$ {Number(payload[1]?.value || 0).toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                dot={false}
                hide
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2 text-muted-foreground">
                Nenhuma venda no período
              </p>
              <p className="text-sm text-muted-foreground">
                Registre suas vendas para ver o gráfico
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}