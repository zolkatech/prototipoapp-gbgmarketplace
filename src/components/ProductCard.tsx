import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { getCategoryLabel } from '@/utils/categories';

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
  };
}

interface ProductCardProps {
  product: Product;
  currentUserId?: string;
  onProductClick: (productId: string) => void;
  categories: Array<{ value: string; label: string }>;
  compact?: boolean;
}

export default function ProductCard({ 
  product, 
  currentUserId, 
  onProductClick, 
  categories,
  compact = false
}: ProductCardProps) {
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorites({
    userId: currentUserId,
    productId: product.id
  });

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const originalPrice = hasDiscount ? product.original_price : product.price * 1.35;
  const discount = hasDiscount ? product.discount_percentage : Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const interestFreeInstallments = product.installment_options?.interest_free_installments || 3;
  const installmentValue = product.price / interestFreeInstallments;
  const primaryImage = product.images?.[0] || product.image_url;

  const formatDeliveryText = (locations: string[] | undefined) => {
    if (!locations || locations.length === 0) return 'Retirar no local';
    
    if (locations.length === 1) {
      return `Entrega: ${locations[0]}`;
    }
    
    // Se tem múltiplos locais, mostrar os principais ou resumir
    if (locations.length <= 3) {
      return `Entrega: ${locations.join(', ')}`;
    }
    
    return `Entrega: ${locations.slice(0, 2).join(', ')} +${locations.length - 2}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite();
  };

  const handleCardClick = () => {
    onProductClick(product.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer bg-white relative">
      {/* Botão de favoritar */}
      <Button
        variant="ghost"
        size="sm"
        className={`absolute top-2 right-2 z-10 p-1 h-8 w-8 rounded-full ${
          isFavorite 
            ? 'bg-success/10 text-success hover:bg-success/20' 
            : 'bg-white/80 hover:bg-white text-gray-600'
        } shadow-sm`}
        onClick={handleFavoriteClick}
        disabled={favoriteLoading}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </Button>

      <div onClick={handleCardClick}>
        <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-gray-400 text-center">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-xs">Sem imagem</div>
              </div>
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs">
              {product.discount_percentage}% OFF
            </Badge>
          )}
          {product.images && product.images.length > 1 && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
              +{product.images.length - 1}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-2 md:p-2.5 space-y-1 md:space-y-1.5">
          <h3 className="font-normal text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight min-h-[1.8rem] md:min-h-[2.2rem]">
            {product.name}
          </h3>
          
          <div className="space-y-0.5 md:space-y-1">
            <div className="text-xs text-gray-500 line-through font-medium">
              R$ {originalPrice.toFixed(2)}
            </div>
            
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-sm md:text-lg font-bold text-success leading-none">
                R$ {product.price.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
              </span>
              <Badge className="bg-success text-success-foreground text-xs px-1 py-0 font-semibold shrink-0">
                {discount}% OFF
              </Badge>
            </div>
            
            <div className="text-xs text-success font-medium">
              {interestFreeInstallments}x R$ {installmentValue.toFixed(2).replace('.', ',')} sem juros
            </div>
            
            <div className="flex items-center gap-1 text-xs text-blue-700 font-medium">
              <span className="text-blue-500">🚚</span>
              <span className="truncate">
                {product.delivers ? 
                  formatDeliveryText(product.delivery_locations)
                  : 'Retirar no local'
                }
              </span>
            </div>
          </div>
          
          <div className="pt-1 md:pt-1.5 border-t border-gray-100">
            <Badge variant="outline" className="text-xs mb-1">
              {getCategoryLabel(product.category)}
            </Badge>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Avatar className="w-3 h-3 shrink-0">
                <AvatarImage src={product.supplier.avatar_url} />
                <AvatarFallback className="text-xs">
                  {(product.supplier.business_name || product.supplier.full_name).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {product.supplier.business_name || product.supplier.full_name}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}