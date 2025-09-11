import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Camera, Package, X, MapPin, Truck, Tag, Percent, Store, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories, getCategoryLabel } from '@/utils/categories';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  images?: string[];
  discount_percentage?: number;
  original_price?: number;
  delivery_locations: string[];
  delivers: boolean;
  installment_options: {
    max_installments: number;
    interest_free_installments: number;
  };
  created_at: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  discount_percentage: number;
  original_price: string;
  delivers: boolean;
  delivery_locations: string[];
  installment_options: {
    max_installments: number;
    interest_free_installments: number;
  };
  service_locations: string[];
}

export default function SupplierProducts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: 'ferramenta',
    images: [],
    discount_percentage: 0,
    original_price: '',
    delivers: true,
    delivery_locations: [] as string[],
    installment_options: {
      max_installments: 0,
      interest_free_installments: 0
    },
    service_locations: ['Local do serviço a combinar'] as string[]
  });

  const categories = [
    { value: 'ferramenta', label: 'Ferramenta' },
    { value: 'racao-feed', label: 'Ração/Feed' },
    { value: 'acessorio', label: 'Acessório' },
    { value: 'medicamento', label: 'Medicamento' },
    { value: 'sela', label: 'Sela' },
    { value: 'freio', label: 'Freio' },
    { value: 'estribo', label: 'Estribo' },
    { value: 'manta', label: 'Manta' },
    { value: 'outros', label: 'Outros' }
  ];

  const deliveryOptions = [
    'Todo o Brasil',
    'Região Sul',
    'Região Sudeste',
    'Região Centro-Oeste',
    'Região Nordeste',
    'Região Norte',
    'Minha cidade apenas'
  ];

  useEffect(() => {
    if (profile) {
      fetchProducts();
    }
  }, [profile]);

  // Função para verificar se é categoria de serviço
  const isServiceCategory = (category: string) => {
    return serviceCategories.some(cat => cat.value === category);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Processar os dados para garantir que installment_options seja um objeto válido
      const processedProducts = (data || []).map(product => ({
        ...product,
        installment_options: (typeof product.installment_options === 'object' && product.installment_options) 
          ? product.installment_options as { max_installments: number; interest_free_installments: number; }
          : {
              max_installments: 3,
              interest_free_installments: 3
            }
      }));
      
      setProducts(processedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !formData.delivery_locations.includes(newLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        delivery_locations: [...prev.delivery_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      delivery_locations: prev.delivery_locations.filter(loc => loc !== location)
    }));
  };

  const addServiceLocation = () => {
    if (newLocation.trim() && !formData.service_locations.includes(newLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        service_locations: [...prev.service_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeServiceLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      service_locations: prev.service_locations.filter(loc => loc !== location)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const isService = isServiceCategory(formData.category);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.images[0] || null,
        images: formData.images,
        category: formData.category,
        discount_percentage: formData.discount_percentage,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        delivery_locations: isService ? formData.service_locations : formData.delivery_locations,
        delivers: isService ? false : formData.delivers,
        installment_options: formData.installment_options
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado!",
          description: "O produto foi atualizado com sucesso."
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            supplier_id: profile.id,
            ...productData
          });

        if (error) throw error;

        toast({
          title: "Produto adicionado!",
          description: "O produto foi adicionado com sucesso."
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    const isServiceType = isServiceCategory(product.category);
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      images: product.images || [],
      discount_percentage: product.discount_percentage || 0,
      original_price: product.original_price?.toString() || '',
      delivers: product.delivers,
      delivery_locations: product.delivery_locations || [],
      installment_options: product.installment_options || {
        max_installments: 0,
        interest_free_installments: 0
      },
      service_locations: isServiceType && product.delivery_locations?.length > 0 
        ? product.delivery_locations 
        : ['Local do serviço a combinar']
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;

      toast({
        title: "Produto excluído!",
        description: "O produto foi excluído com sucesso."
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto.",
        variant: "destructive"
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'ferramenta',
      images: [],
      discount_percentage: 0,
      original_price: '',
      delivers: true,
      delivery_locations: [],
      installment_options: {
        max_installments: 0,
        interest_free_installments: 0
      },
      service_locations: ['Local do serviço a combinar']
    });
    setEditingProduct(null);
  };

  const isService = isServiceCategory(formData.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meus Produtos</h2>
          <p className="text-muted-foreground">Gerencie seus produtos e serviços</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Edite as informações do produto' : 'Preencha as informações do produto ou serviço'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto/Serviço</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Sela de montaria"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu produto ou serviço..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Preço Original (opcional)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Desconto (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Opções de parcelamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Opções de Parcelamento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_installments">Máximo de parcelas</Label>
                    <Select 
                      value={formData.installment_options.max_installments.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        installment_options: { 
                          ...prev.installment_options, 
                          max_installments: parseInt(value) 
                        } 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o máximo de parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Não parcelo</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="3">3x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                        <SelectItem value="6">6x</SelectItem>
                        <SelectItem value="12">12x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest_free_installments">Parcelas sem juros</Label>
                    <Select 
                      value={formData.installment_options.interest_free_installments.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        installment_options: { 
                          ...prev.installment_options, 
                          interest_free_installments: parseInt(value) 
                        } 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione parcelas sem juros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Não parcelo</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="3">3x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                        <SelectItem value="6">6x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.installment_options.max_installments > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Exemplo: {formData.installment_options.interest_free_installments > 0 
                      ? `${formData.installment_options.interest_free_installments}x R$ ${(parseFloat(formData.price) / formData.installment_options.interest_free_installments || 1).toFixed(2)} sem juros`
                      : "À vista apenas"
                    }
                  </p>
                )}
              </div>

              {/* Configurações de entrega */}
              {!isService && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="delivers"
                      checked={formData.delivers}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        delivers: checked,
                        delivery_locations: checked ? prev.delivery_locations : []
                      }))}
                    />
                    <Label htmlFor="delivers">Faz entrega</Label>
                  </div>

                  {formData.delivers && (
                    <div className="space-y-3">
                      <Label>Locais de entrega</Label>
                      <div className="flex flex-wrap gap-2">
                        {deliveryOptions.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={location}
                              checked={formData.delivery_locations.includes(location)}
                              onCheckedChange={(checked) => {
                                if (checked && !formData.delivery_locations.includes(location)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    delivery_locations: [...prev.delivery_locations, location]
                                  }));
                                } else if (!checked) {
                                  removeLocation(location);
                                }
                              }}
                            />
                            <Label htmlFor={location} className="text-sm">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {formData.delivery_locations.length > 0 && (
                        <div className="space-y-2">
                          <Label>Locais selecionados:</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.delivery_locations.map((location) => (
                              <Badge key={location} variant="secondary" className="gap-1">
                                {location}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 w-4 h-4"
                                  onClick={() => removeLocation(location)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Configurações de localização para serviços */}
              {isService && (
                <div className="space-y-4">
                  <Label>Locais onde presta o serviço</Label>
                  <div className="flex flex-wrap gap-2">
                    {deliveryOptions.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={location}
                          checked={formData.service_locations.includes(location)}
                          onCheckedChange={(checked) => {
                            if (checked && !formData.service_locations.includes(location)) {
                              setFormData(prev => ({
                                ...prev,
                                service_locations: [...prev.service_locations, location]
                              }));
                            } else if (!checked) {
                              removeServiceLocation(location);
                            }
                          }}
                        />
                        <Label htmlFor={location} className="text-sm">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {formData.service_locations.length > 0 && (
                    <div className="space-y-2">
                      <Label>Locais selecionados:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.service_locations.map((location) => (
                          <Badge key={location} variant="secondary" className="gap-1">
                            {location}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 w-4 h-4"
                              onClick={() => removeServiceLocation(location)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden shadow-soft hover:shadow-golden transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {(product.images && product.images.length > 0) || product.image_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={product.images?.[0] || product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(product.category)}
                        </Badge>
                        <span className="text-lg font-bold text-green-600">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      {/* Informações de entrega/localização */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                        {isServiceCategory(product.category) ? (
                          <>
                            <MapPin className="w-4 h-4" />
                            <span>
                              {product.delivery_locations && product.delivery_locations.length > 0 
                                ? product.delivery_locations.length === 1 
                                  ? product.delivery_locations[0]
                                  : `${product.delivery_locations[0]} +${product.delivery_locations.length - 1}`
                                : 'Local a combinar'
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            {product.delivers ? (
                              <>
                                <Truck className="w-4 h-4" />
                                <span>
                                  {product.delivery_locations && product.delivery_locations.length > 0 
                                    ? product.delivery_locations.length === 1 
                                      ? `Entrega: ${product.delivery_locations[0]}`
                                      : `Entrega: ${product.delivery_locations[0]} +${product.delivery_locations.length - 1}`
                                    : 'Entrega disponível'
                                  }
                                </span>
                              </>
                            ) : (
                              <>
                                <Store className="w-4 h-4" />
                                <span>Retirar no local</span>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {/* Informações de parcelamento */}
                      {product.installment_options?.max_installments > 0 && (
                        <div className="text-sm text-green-600 mt-1">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          {product.installment_options.max_installments}x sem juros
                        </div>
                      )}

                      {/* Descrição do produto */}
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(product.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum produto cadastrado</p>
            <p>Comece adicionando seu primeiro produto!</p>
          </div>
        </Card>
      )}

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}