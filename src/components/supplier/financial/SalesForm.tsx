
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Product = { id: string; name: string; price: number };
type Client = { id: string; name: string; email?: string | null };

type Props = {
  supplierId: string;
  products: Product[];
  clients: Client[];
  onSuccess: () => void;
};

export default function SalesForm({ supplierId, products, clients, onSuccess }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    product_name: '',
    sale_value: '',
    profit: '',
    payment_method: '' as 'pix' | 'dinheiro' | 'cartao' | 'boleto' | '',
    supplier_client_id: '' as string,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    if (!formData.product_name || !formData.payment_method || !formData.supplier_client_id) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const payload = {
      supplier_id: supplierId,
      product_name: formData.product_name,
      sale_value: parseFloat(formData.sale_value || '0'),
      profit: parseFloat(formData.profit || '0'),
      payment_method: formData.payment_method || null,
      supplier_client_id: formData.supplier_client_id || null,
    };

    const { error } = await supabase.from('sales').insert(payload as any);
    setLoading(false);

    if (error) {
      console.error(error);
      toast({ title: 'Erro ao registrar', description: 'Não foi possível registrar a venda.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Venda registrada!', description: 'A venda foi registrada com sucesso.' });
    setFormData({ product_name: '', sale_value: '', profit: '', payment_method: '', supplier_client_id: '' });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product_name">Produto Vendido</Label>
        {products.length > 0 ? (
          <Select
            value={formData.product_name}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, product_name: value }))}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.name}>
                  {product.name} - R$ {Number(product.price).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Nenhum produto cadastrado.</p>
            <p className="text-xs">Cadastre produtos primeiro em "Meus Produtos".</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sale_value">Valor da Venda (R$)</Label>
          <Input
            id="sale_value"
            type="number"
            step="0.01"
            min="0"
            value={formData.sale_value}
            onChange={(e) => setFormData((prev) => ({ ...prev, sale_value: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profit">Lucro (R$)</Label>
          <Input
            id="profit"
            type="number"
            step="0.01"
            min="0"
            value={formData.profit}
            onChange={(e) => setFormData((prev) => ({ ...prev, profit: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, payment_method: value as 'pix' | 'dinheiro' | 'cartao' | 'boleto' }))
            }
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cliente vinculado</Label>
          <Select
            value={formData.supplier_client_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, supplier_client_id: value }))}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={clients.length ? 'Selecione o cliente' : 'Nenhum cliente cadastrado'} />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading || products.length === 0 || !formData.product_name || !formData.payment_method || !formData.supplier_client_id
        }
      >
        {loading ? 'Registrando...' : 'Registrar Venda'}
      </Button>
    </form>
  );
}

