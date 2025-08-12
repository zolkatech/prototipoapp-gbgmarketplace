import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Camera, Package, X, MapPin, Truck, Tag, Percent, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  discount_percentage: number;
  original_price?: number;
  delivery_locations: string[];
  delivers: boolean;
  created_at: string;
  installment_options?: {
    max_installments: number;
    interest_free_installments: number;
  };
}

export default function SupplierProducts() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: 0,
    images: [] as string[],
    category: '',
    delivers: true,
    delivery_locations: [] as string[],
    installment_options: {
      max_installments: 3,
      interest_free_installments: 3
    }
  });
  const [isService, setIsService] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const categories = [
    { value: 'servico', label: 'Serviços para Cavalos' },
    { value: 'ferradura', label: 'Ferradura' },
    { value: 'grosa', label: 'Grosa' },
    { value: 'acessorio', label: 'Acessório' },
    { value: 'ferramenta', label: 'Ferramenta' },
    { value: 'cravo', label: 'Cravo' },
    { value: 'sela', label: 'Sela' },
    { value: 'freio', label: 'Freio' },
    { value: 'estribo', label: 'Estribo' },
    { value: 'cuidados', label: 'Cuidados' },
    { value: 'outros', label: 'Outros' }
  ];

  const defaultLocations = [
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
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || formData.images.length >= 3) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, data.publicUrl]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.images[0] || null,
        images: formData.images,
        category: isService ? 'outros' : formData.category,
        discount_percentage: formData.discount_percentage,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        delivery_locations: isService ? [] : formData.delivery_locations,
        delivers: isService ? false : formData.delivers,
        installment_options: isService ? null : formData.installment_options
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
    setEditingProduct(product);
    setIsService(product.category === 'servico');
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      discount_percentage: product.discount_percentage || 0,
      images: product.images || [],
      category: product.category || '',
      delivers: product.delivers,
      delivery_locations: product.delivery_locations || [],
      installment_options: product.installment_options || {
        max_installments: 3,
        interest_free_installments: 3
      }
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

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
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: 0,
      images: [],
      category: '',
      delivers: true,
      delivery_locations: [],
      installment_options: {
        max_installments: 3,
        interest_free_installments: 3
      }
    });
    setEditingProduct(null);
    setNewLocation('');
    setIsService(false);
  };

  return (
    <div className="space-y-6">
      <div className={isMobile ? "flex flex-col items-center space-y-4 text-center" : "flex justify-between items-center"}>
        {/* Layout mobile: vertical e centralizado */}
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Minha Vitrine</h2>
          </div>
        ) : (
          /* Layout desktop: Título Minha Loja à esquerda */
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Minha Vitrine</h2>
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-golden">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto/Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto/Serviço' : 'Adicionar Novo Produto/Serviço'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do produto abaixo
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo: Produto ou Serviço */}
              <div className="flex items-center justify-between">
                <Label>Tipo</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isService ? 'Serviço' : 'Produto'}</span>
                  <Switch
                    checked={isService}
                    onCheckedChange={(checked) => {
                      setIsService(!!checked);
                      setFormData(prev => ({ ...prev, category: checked ? 'servico' : '' }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{isService ? 'Nome do Serviço' : 'Nome do Produto'}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={isService ? 'Nome do serviço' : 'Nome do produto'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                {isService ? (
                  <div className="p-3 rounded-md border text-sm">
                    Serviços para Cavalos
                  </div>
                ) : (
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value !== 'servico').map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isService ? 'Descrição do serviço' : 'Descrição do produto'}
                  rows={3}
                />
              </div>

              {/* Preço e Desconto */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço Atual (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="99"
                    value={formData.discount_percentage}
                    onChange={(e) => {
                      const discount = parseInt(e.target.value) || 0;
                      const currentPrice = parseFloat(formData.price) || 0;
                      setFormData(prev => ({ 
                        ...prev, 
                        discount_percentage: discount,
                        original_price: discount > 0 ? (currentPrice / (1 - discount / 100)).toFixed(2) : ''
                      }));
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.discount_percentage > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Preço original: R$ {formData.original_price} 
                      {formData.discount_percentage > 0 && ` (${formData.discount_percentage}% OFF)`}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Upload de Imagens */}
              <div className="space-y-2">
                <Label>Fotos do Produto (até 3)</Label>
                <div className="space-y-4">
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.images.length < 3 && (
                    <label className="block">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          Adicionar Foto ({formData.images.length}/3)
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Entrega (apenas para produtos) */}
              {!isService && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Opções de Entrega</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.delivers}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          delivers: checked,
                          delivery_locations: checked ? prev.delivery_locations : []
                        }))}
                      />
                      <Label className="text-sm">
                        {formData.delivers ? 'Faço entregas' : 'Não faço entregas'}
                      </Label>
                    </div>
                  </div>

                  {formData.delivers && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite um local de entrega"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                        />
                        <Button type="button" onClick={addLocation} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Locais sugeridos:</Label>
                        <div className="flex flex-wrap gap-2">
                          {defaultLocations.map((location) => (
                            <Button
                              key={location}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                if (!formData.delivery_locations.includes(location)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    delivery_locations: [...prev.delivery_locations, location]
                                  }));
                                }
                              }}
                            >
                              {location}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {formData.delivery_locations.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Locais selecionados:</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.delivery_locations.map((location) => (
                              <Badge key={location} variant="secondary" className="gap-1">
                                <MapPin className="w-3 h-3" />
                                {location}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1"
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

              {/* Opções de Parcelamento (apenas para produtos) */}
              {!isService && (
                <div className="space-y-4">
                  <Label>Opções de Parcelamento</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_installments">Máximo de Parcelas</Label>
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest_free_installments">Parcelas sem Juros</Label>
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: formData.installment_options.max_installments }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x sem juros
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-700 text-sm">
                      <strong>Exemplo:</strong> {formData.installment_options.interest_free_installments}x de R$ {(parseFloat(formData.price) / formData.installment_options.interest_free_installments || 0).toFixed(2)} sem juros
                      {formData.installment_options.max_installments > formData.installment_options.interest_free_installments && 
                        ` ou até ${formData.installment_options.max_installments}x com juros`
                      }
                    </div>
                  </div>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden shadow-soft hover:shadow-golden transition-shadow">
            {(product.images?.length > 0 || product.image_url) && (
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={product.images?.[0] || product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {product.discount_percentage > 0 && (
                  <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
                    {product.discount_percentage}% OFF
                  </Badge>
                )}
                {product.images?.length > 1 && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    +{product.images.length - 1}
                  </Badge>
                )}
              </div>
            )}
            <CardContent className="p-2 md:p-3">
              <div className="space-y-1 md:space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-medium text-xs md:text-sm line-clamp-2 leading-tight">{product.name}</h3>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {categories.find(cat => cat.value === product.category)?.label || product.category}
                  </Badge>
                </div>
                
                <div className="space-y-0.5 md:space-y-1">
                  {product.original_price && product.discount_percentage > 0 && (
                    <div className="text-xs text-muted-foreground line-through">
                      R$ {product.original_price.toFixed(2)}
                    </div>
                  )}
                  <Badge variant="secondary" className="text-xs md:text-sm font-bold">
                    R$ {product.price.toFixed(2)}
                  </Badge>
                </div>

                {/* Informações de entrega (não aplicável para serviços) */}
                {product.category !== 'servico' && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    <span className="truncate">
                      {product.delivers ? 
                        (product.delivery_locations && product.delivery_locations.length > 0 
                          ? product.delivery_locations.length === 1 
                            ? `Entrega: ${product.delivery_locations[0]}`
                            : `Entrega: ${product.delivery_locations.slice(0, 2).join(', ')}${product.delivery_locations.length > 2 ? ` +${product.delivery_locations.length - 2}` : ''}`
                          : 'Retirar no local'
                        ) : 'Retirar no local'
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-1 md:pt-2">
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="h-7 w-7 p-0 md:h-8 md:w-8"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive hover:text-destructive h-7 w-7 p-0 md:h-8 md:w-8"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
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
    </div>
  );
}