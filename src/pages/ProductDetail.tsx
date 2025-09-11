import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import ImageGallery from '@/components/ImageGallery';
import ProductCard from '@/components/ProductCard';
import { getCategoryLabel, serviceCategories } from '@/utils/categories';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Package,
  Share2,
  Heart,
  Globe,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Truck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { generateWhatsAppURL } from '@/lib/whatsapp-utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[];
  category: string;
  discount_percentage?: number;
  original_price?: number;
  delivery_locations?: string[];
  delivers?: boolean;
  installment_options?: {
    max_installments: number;
    interest_free_installments: number;
  };
  supplier: {
    id: string;
    business_name: string;
    full_name: string;
    city: string;
    state: string;
    avatar_url: string;
    bio: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    website?: string;
    instagram?: string;
    cep?: string;
    cpf_cnpj?: string;
    specialties?: string[];
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { profile, user } = useAuth(); // Usar o hook de autenticação central
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hook de favoritos
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorites({
    userId: profile?.id,
    productId: productId
  });

  const categories = [
    { value: 'ferradura', label: 'Ferradura' },
    { value: 'grosa', label: 'Grosa' },
    { value: 'acessorio', label: 'Acessório' },
    { value: 'ferramenta', label: 'Ferramenta' },
    { value: 'cravo', label: 'Cravo' },
    { value: 'sela', label: 'Sela' },
    { value: 'freio', label: 'Freio' },
    { value: 'estribo', label: 'Estribo' },
    { value: 'outros', label: 'Outros' },
    { value: 'servico', label: 'Serviços para Cavalos' }
  ];

  useEffect(() => {
    if (productId) {
      // Scroll para o topo quando um novo produto é carregado
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, description, price, original_price, discount_percentage, image_url, images, category, delivers, delivery_locations, installment_options, supplier_id')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (productData) {
        // Buscar informações completas do fornecedor
        const { data: supplierData } = await supabase
          .from('profiles')
          .select('id, business_name, full_name, city, state, avatar_url, bio, phone, whatsapp, email, address, website, instagram, cep, cpf_cnpj, specialties')
          .eq('id', productData.supplier_id)
          .maybeSingle();

        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage || 0,
          image_url: productData.image_url || '',
          images: productData.images || [],
          category: productData.category || '',
          delivers: productData.delivers,
          delivery_locations: productData.delivery_locations || [],
          installment_options: productData.installment_options || {
            max_installments: 3,
            interest_free_installments: 3
          },
          supplier: {
            id: supplierData?.id || productData.supplier_id || '',
            business_name: supplierData?.business_name || '',
            full_name: supplierData?.full_name || '',
            city: supplierData?.city || '',
            state: supplierData?.state || '',
            avatar_url: supplierData?.avatar_url || '',
            bio: supplierData?.bio || '',
            phone: supplierData?.phone || '',
            whatsapp: supplierData?.whatsapp || '',
            email: supplierData?.email || '',
            address: supplierData?.address || '',
            website: supplierData?.website || '',
            instagram: supplierData?.instagram || '',
            cep: supplierData?.cep || '',
            cpf_cnpj: supplierData?.cpf_cnpj || '',
            specialties: supplierData?.specialties || []
          }
        };

        setProduct(formattedProduct);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at')
          .eq('supplier_id', formattedProduct.supplier.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (reviewsData) {
          setReviews(reviewsData.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment || '',
            created_at: review.created_at,
            profiles: {
              full_name: 'Usuário'
            }
          })));
        }

        const { data: relatedData } = await supabase
          .from('products')
          .select('id, name, description, price, image_url, images, category, supplier_id')
          .eq('supplier_id', formattedProduct.supplier.id)
          .neq('id', productId)
          .limit(4);

        if (relatedData) {
          const relatedSupplierIds = Array.from(new Set((relatedData || []).map(p => p.supplier_id).filter(Boolean)));
          let suppliersMap: Record<string, { business_name: string; avatar_url: string; bio: string }> = {};
          if (relatedSupplierIds.length > 0) {
            const { data: suppliers } = await supabase
              .from('profiles_public')
              .select('id, business_name, avatar_url, bio')
              .in('id', relatedSupplierIds);
            (suppliers || []).forEach(s => {
              suppliersMap[s.id] = { business_name: s.business_name || '', avatar_url: s.avatar_url || '', bio: s.bio || '' };
            });
          }
          setRelatedProducts(relatedData.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            image_url: p.image_url || '',
            images: p.images || [],
            category: p.category || '',
            supplier: {
              id: p.supplier_id || '',
              business_name: suppliersMap[p.supplier_id!]?.business_name || '',
              full_name: '',
              city: '',
              state: '',
              avatar_url: suppliersMap[p.supplier_id!]?.avatar_url || '',
              bio: suppliersMap[p.supplier_id!]?.bio || '',
              website: '',
              instagram: ''
            }
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do produto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (product && product.supplier.whatsapp) {
      const message = `Olá! Vi seu produto "${product.name}" no GBG Marketplace e gostaria de mais informações.`;
      const whatsappUrl = generateWhatsAppURL(product.supplier.whatsapp, message);
      
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      } else {
        toast({
          title: 'Número inválido',
          description: 'O número do WhatsApp cadastrado pelo fornecedor é inválido.',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'WhatsApp não disponível',
        description: 'Este fornecedor não cadastrou WhatsApp.',
        variant: 'destructive'
      });
    }
  };

  const handleEmailContact = () => {
    if (product && product.supplier.email) {
      const subject = `Interesse no produto: ${product.name}`;
      const body = `Olá ${product.supplier.business_name || product.supplier.full_name},\n\nVi seu produto "${product.name}" no GBG Marketplace e gostaria de mais informações.\n\nAguardo seu contato.`;
      const mailtoUrl = `mailto:${product.supplier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    } else {
      toast({
        title: 'E-mail não disponível',
        description: 'Este fornecedor não cadastrou e-mail para contato.',
        variant: 'destructive'
      });
    }
  };

  const handlePhoneContact = () => {
    if (product && product.supplier.phone) {
      const phoneUrl = `tel:${product.supplier.phone}`;
      window.open(phoneUrl);
    } else {
      toast({
        title: 'Telefone não disponível',
        description: 'Este fornecedor não cadastrou telefone.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Confira este produto: ${product?.name}`,
          url: url,
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link copiado!',
          description: 'O link do produto foi copiado para a área de transferência.',
        });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link copiado!',
        description: 'O link do produto foi copiado para a área de transferência.',
      });
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketplaceHeader showCategories={false} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketplaceHeader showCategories={false} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar para o marketplace
          </Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const originalPrice = hasDiscount ? product.original_price : product.price * 1.35;
  const discount = hasDiscount ? product.discount_percentage : Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const interestFreeInstallments = product.installment_options?.interest_free_installments || 3;
  const installmentValue = product.price / interestFreeInstallments;
  
  // Verificar se é serviço baseado na categoria
  const isServiceCategory = serviceCategories.some(cat => cat.value === product.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader showCategories={false} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Marketplace / {getCategoryLabel(product.category)} / {product.name}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Imagem do produto */}
          <div className="space-y-4">
            <ImageGallery 
              images={product.images?.filter(img => img) || (product.image_url ? [product.image_url] : [])}
              productName={product.name}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                {(product.images?.[0] || product.image_url) ? (
                  <img 
                    src={product.images?.[0] || product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
            </ImageGallery>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={isFavorite ? 'bg-red-50 text-red-600 border-red-200' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favoritado' : 'Favoritar'}
              </Button>
            </div>
          </div>

          {/* Detalhes do produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">
                  {getCategoryLabel(product.category)}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              {hasDiscount && (
                <div className="text-sm text-destructive line-through">
                  R$ {originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-success">
                  R$ {product.price.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
                </span>
                {hasDiscount && (
                  <Badge className="bg-success text-success-foreground text-sm px-2 py-1">
                    {product.discount_percentage}% OFF
                  </Badge>
                )}
              </div>
              
              {product.installment_options && (
                <div className="text-lg text-success font-medium">
                  {interestFreeInstallments}x R$ {installmentValue.toFixed(2).replace('.', ',')} sem juros
                </div>
              )}
              
              <div className="flex items-center gap-2 text-success font-semibold">
                {isServiceCategory ? (
                  <>
                    <span className="text-blue-500">📍</span>
                    {product.delivery_locations && product.delivery_locations.length > 0 
                      ? product.delivery_locations.join(', ')
                      : 'Local a combinar'}
                  </>
                ) : (
                  <>
                    {product.delivers ? (
                      <>
                        <span className="text-yellow-500">🚚</span>
                        {product.delivery_locations && product.delivery_locations.length > 0 
                          ? `Entrega: ${product.delivery_locations.join(', ')}` 
                          : 'Entrega disponível'}
                      </>
                    ) : (
                      <>
                        <span className="text-blue-500">🏪</span>
                        Retirar no local
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Informações do fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fornecedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.supplier.avatar_url} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {(product.supplier.business_name || product.supplier.full_name).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {product.supplier.business_name || product.supplier.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {product.supplier.city && product.supplier.state ? 
                        `${product.supplier.city}, ${product.supplier.state}` : 
                        'Localização não informada'
                      }
                    </div>
                    {product.supplier.specialties && product.supplier.specialties.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Especialidades:</strong> {product.supplier.specialties.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {product.supplier.bio && (
                  <p className="text-sm text-gray-600">
                    {product.supplier.bio}
                  </p>
                )}
                
                {product.supplier.address && (
                  <div className="text-sm text-gray-600">
                    <strong>Endereço:</strong> {product.supplier.address}
                    {product.supplier.cep && `, CEP: ${product.supplier.cep}`}
                  </div>
                )}

                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({reviews.length} avaliações)
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppContact}
                    disabled={!product.supplier.whatsapp}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {product.supplier.whatsapp ? 'Conversar no WhatsApp' : 'WhatsApp não disponível'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleEmailContact}
                      disabled={!product.supplier.email}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {product.supplier.email ? 'E-mail' : 'Sem e-mail'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handlePhoneContact}
                      disabled={!product.supplier.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {product.supplier.phone ? 'Telefone' : 'Sem telefone'}
                    </Button>
                  </div>

                  {/* Social Media Links */}
                  {(product.supplier.website || product.supplier.instagram) && (
                    <div className="grid grid-cols-2 gap-2">
                      {product.supplier.website && (
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(product.supplier.website, '_blank')}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </Button>
                      )}
                      {product.supplier.instagram && (
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(`https://instagram.com/${product.supplier.instagram.replace('@', '')}`, '_blank')}
                        >
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Descrição do produto */}
        {product.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Descrição do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Avaliações */}
        {reviews.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Avaliações do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">
                        {review.profiles.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Produtos relacionados */}
        {relatedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Outros produtos deste fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    currentUserId={profile?.id}
                    onProductClick={(productId) => navigate(`/product/${productId}`)}
                    categories={categories}
                    compact={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}