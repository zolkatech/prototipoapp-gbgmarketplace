import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';

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
  supplier: {
    id: string;
    business_name: string;
    full_name: string;
    city: string;
    state: string;
    avatar_url: string;
  };
}

interface CategorySectionProps {
  categoryValue: string;
  categoryLabel: string;
  currentUserId?: string;
}

export default function CategorySection({ categoryValue, categoryLabel, currentUserId }: CategorySectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    fetchCategoryProducts();
  }, [categoryValue]);

  const fetchCategoryProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          images,
          category,
          supplier_id,
          discount_percentage,
          original_price,
          delivery_locations,
          delivers,
          profiles!products_supplier_id_fkey (
            id,
            business_name,
            full_name,
            city,
            state,
            avatar_url
          )
        `)
        .eq('category', categoryValue)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        images: product.images || [],
        category: product.category || '',
        discount_percentage: product.discount_percentage || 0,
        original_price: product.original_price || null,
        delivery_locations: product.delivery_locations || [],
        delivers: product.delivers ?? true,
        supplier: {
          id: product.profiles?.id || '',
          business_name: product.profiles?.business_name || '',
          full_name: product.profiles?.full_name || '',
          city: product.profiles?.city || '',
          state: product.profiles?.state || '',
          avatar_url: product.profiles?.avatar_url || ''
        }
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate(`/dashboard?category=${categoryValue}`);
  };

  if (loading) {
    return (
    <section className="py-4">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{categoryLabel}</h3>
          <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{categoryLabel}</h3>
          <Badge variant="secondary" className="text-sm">
            {products.length} produto{products.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAll}
          className="text-primary hover:text-primary-foreground"
        >
          Ver todos
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentUserId={currentUserId}
            onProductClick={(productId) => navigate(`/product/${productId}`)}
            categories={categories}
            compact={true}
          />
        ))}
      </div>
    </section>
  );
}