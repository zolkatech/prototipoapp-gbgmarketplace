import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, MapPin, Truck, Tag, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories, productCategories, getCategoryLabel } from '@/utils/categories';
import ProductForm from './forms/ProductForm';
import ServiceForm from './forms/ServiceForm';

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
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'product' | 'service'>('product');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const isService = isServiceCategory(formData.category);
      
      // Calcular preço original se não foi informado mas há desconto
      let calculatedOriginalPrice = formData.original_price ? parseFloat(formData.original_price) : null;
      
      if (!formData.original_price && formData.discount_percentage > 0) {
        // Se não foi informado preço original mas há desconto, calcular automaticamente
        // Preço atual = Preço original * (1 - desconto/100)
        // Preço original = Preço atual / (1 - desconto/100)
        const currentPrice = parseFloat(formData.price);
        const discountFactor = 1 - (formData.discount_percentage / 100);
        calculatedOriginalPrice = currentPrice / discountFactor;
      }
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.images[0] || null,
        images: formData.images,
        category: formData.category,
        discount_percentage: formData.discount_percentage,
        original_price: calculatedOriginalPrice,
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
    setSelectedType(isServiceType ? 'service' : 'product');
    
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
      category: selectedType === 'product' ? 'ferramenta' : 'ferrageamento',
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
              Adicionar {selectedType === 'product' ? 'Produto' : 'Serviço'}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct 
                  ? `Editar ${isServiceCategory(editingProduct.category) ? 'Serviço' : 'Produto'}` 
                  : `Adicionar Novo ${selectedType === 'product' ? 'Produto' : 'Serviço'}`
                }
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? `Edite as informações do ${isServiceCategory(editingProduct.category) ? 'serviço' : 'produto'}` 
                  : 'Selecione o tipo e preencha as informações'
                }
              </DialogDescription>
            </DialogHeader>
            
            {!editingProduct && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tipo de Cadastro</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={selectedType === 'product' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedType('product');
                      resetForm();
                    }}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Produto</span>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedType === 'service' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedType('service');
                      resetForm();
                    }}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Store className="h-6 w-6" />
                    <span>Serviço</span>
                  </Button>
                </div>
              </div>
            )}

            {selectedType === 'product' ? (
              <ProductForm
                supplierId={profile.id}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
                loading={loading}
                editingProduct={editingProduct}
              />
            ) : (
              <ServiceForm
                supplierId={profile.id}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
                loading={loading}
                editingProduct={editingProduct}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid - Cards verticais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-fit">
            <div className="relative">
              {/* Imagem do produto */}
              {(product.images && product.images.length > 0) || product.image_url ? (
                <div className="w-full h-48 bg-gray-100 border-b">
                  <img 
                    src={product.images?.[0] || product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 border-b flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Badge de desconto */}
              {product.discount_percentage && product.discount_percentage > 0 ? (
                <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs px-2 py-1">
                  -{product.discount_percentage}%
                </Badge>
              ) : null}
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Cabeçalho */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                <Badge variant="outline" className="text-xs w-fit">
                  <Tag className="w-3 h-3 mr-1" />
                  {getCategoryLabel(product.category)}
                </Badge>
              </div>
              
              {/* Preço */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {(() => {
                    // Se tem original_price definido, usa ele
                    if (product.original_price && product.original_price > product.price) {
                      return (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.original_price.toFixed(2).replace('.', ',')}
                        </span>
                      );
                    }
                    // Se não tem original_price mas tem desconto, calcula automaticamente
                    else if (!product.original_price && product.discount_percentage && product.discount_percentage > 0) {
                      const calculatedOriginalPrice = product.price / (1 - product.discount_percentage / 100);
                      return (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {calculatedOriginalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                {/* Informações de parcelamento */}
                {product.installment_options?.max_installments > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    Até {product.installment_options.max_installments}x sem juros
                  </p>
                )}
              </div>
              
              {/* Informações de entrega/localização */}
              <div className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1.5 rounded">
                {isServiceCategory(product.category) ? (
                  <>
                    <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
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
                        <Truck className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">
                          {product.delivery_locations && product.delivery_locations.length > 0 
                            ? product.delivery_locations.length === 1 
                              ? product.delivery_locations[0]
                              : `${product.delivery_locations[0]} +${product.delivery_locations.length - 1}`
                            : 'Entrega disponível'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <Store className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-700">Retirar no local</span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Descrição truncada */}
              {product.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="flex-1 h-8 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(product.id)}
                  className="flex-1 h-8 text-xs text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
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
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}