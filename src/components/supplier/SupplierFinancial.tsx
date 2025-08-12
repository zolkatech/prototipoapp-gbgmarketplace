import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, Percent, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SalesForm from './financial/SalesForm';
import ExpensesSection from './financial/ExpensesSection';
import SettingsSection from './financial/SettingsSection';
import ReportsSection from './financial/ReportsSection';

interface Sale {
  id: string;
  product_name: string;
  sale_value: number;
  profit: number;
  created_at: string;
  payment_method?: 'pix' | 'dinheiro' | 'cartao' | 'boleto' | null;
  supplier_client_id?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
}

interface Expense {
  id: string;
  supplier_id: string;
  category: 'combustivel_deslocamento' | 'material' | 'alimentacao' | 'impostos' | 'outros';
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export default function SupplierFinancial() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgProfitMargin: 0
  });

  // Filtro de mês (YYYY-MM) e listas filtradas
  const [year, month] = selectedMonth.split('-').map(Number);
  const filteredSales = sales.filter((s) => {
    const d = new Date(s.created_at);
    return d.getFullYear() === year && d.getMonth() === (month - 1);
  });
  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d.getFullYear() === year && d.getMonth() === (month - 1);
  });

  useEffect(() => {
    if (profile) {
      fetchSales();
      fetchProducts();
      fetchClients();
      fetchExpenses();
      fetchSettings();
    }
  }, [profile]);

  useEffect(() => {
    calculateStats();
  }, [sales, selectedMonth]);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('supplier_id', profile!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales((data || []) as Sale[]);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('supplier_id', profile!.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_clients')
        .select('id, name, email')
        .eq('supplier_id', profile!.id)
        .order('name', { ascending: true });
      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('supplier_id', profile!.id)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      setExpenses((data || []) as Expense[]);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_financial_settings')
        .select('tax_rate')
        .eq('supplier_id', profile!.id)
        .maybeSingle();
      if (error) throw error;
      setTaxRate(Number(data?.tax_rate || 0));
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const calculateStats = () => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.sale_value), 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + Number(sale.profit), 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    setStats({
      totalSales,
      totalRevenue,
      totalProfit,
      avgProfitMargin: Math.round(avgProfitMargin * 10) / 10
    });
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (error) throw error;

      toast({
        title: "Venda deletada!",
        description: "A venda foi removida do histórico."
      });

      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar a venda.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className={isMobile ? "flex flex-col items-center space-y-4 text-center" : "flex justify-between items-center"}>
        <div className={isMobile ? "" : ""}>
          <h2 className="text-2xl font-bold">Controle Financeiro</h2>
          {!isMobile && (
            <p className="text-muted-foreground">
              Registre suas vendas e acompanhe seu desempenho
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto sm:justify-end">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-40"
            aria-label="Selecionar mês"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-golden">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
                <DialogDescription>
                  Adicione uma nova venda ao seu controle financeiro
                </DialogDescription>
              </DialogHeader>
              {/* Sales Form with payment method + client */}
              <SalesForm
                supplierId={profile?.id || ''}
                products={products}
                clients={clients}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchSales();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Vendas
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalSales}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </p>
                <p className="text-2xl font-bold text-primary">
                  R$ {stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lucro Total
                </p>
                <p className="text-2xl font-bold text-primary">
                  R$ {stats.totalProfit.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Margem Média
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.avgProfitMargin}%
                </p>
              </div>
              <Percent className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Suas vendas registradas mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length > 0 ? (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{sale.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4 items-center text-left sm:text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Venda</p>
                      <Badge variant="outline" className="text-sm">
                        R$ {Number(sale.sale_value).toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro</p>
                      <Badge variant="secondary" className="text-sm">
                        R$ {Number(sale.profit).toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <Badge variant="outline" className="text-sm">
                        {((Number(sale.profit) / Math.max(1, Number(sale.sale_value))) * 100).toFixed(1)}%
                      </Badge>
                    </div>

                    {sale.payment_method && (
                      <div>
                        <p className="text-sm text-muted-foreground">Pagamento</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {sale.payment_method}
                        </Badge>
                      </div>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteSale(sale.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2 text-muted-foreground">
                Nenhuma venda registrada
              </p>
              <p className="text-muted-foreground">
                Comece registrando sua primeira venda!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <ExpensesSection supplierId={profile?.id || ''} expenses={filteredExpenses} onRefresh={fetchExpenses} />

      {/* Settings */}
      <SettingsSection
        supplierId={profile?.id || ''}
        initialTaxRate={taxRate}
        onSaved={(rate) => setTaxRate(rate)}
      />

      {/* Reports */}
      <ReportsSection
        sales={filteredSales.map(s => ({ id: s.id, sale_value: Number(s.sale_value), profit: Number(s.profit), created_at: s.created_at }))}
        expenses={filteredExpenses.map(e => ({ id: e.id, amount: Number(e.amount), expense_date: e.expense_date }))}
        taxRate={taxRate}
      />
    </div>
  );
}
