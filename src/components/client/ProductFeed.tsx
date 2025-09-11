import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import { generateEquineMockProducts } from '@/utils/mockData';
import { getCategoryLabel, getAllCategories } from '@/utils/categories';

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

interface ProductFeedProps {
  searchQuery: string;
  selectedCategory?: string;
}

export default function ProductFeed({ searchQuery, selectedCategory = '' }: ProductFeedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{id: string} | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = getAllCategories();

  useEffect(() => {
    fetchProducts();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .rpc('get_current_user_profile')
          .maybeSingle();
        
        if (profileData) {
          setCurrentUser({ id: (profileData as any).id });
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, images, category, supplier_id, discount_percentage, original_price, delivery_locations, delivers')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const supplierIds = Array.from(new Set((data || []).map(p => p.supplier_id).filter(Boolean)));

      let suppliersMap: Record<string, { id: string; business_name: string; avatar_url: string }> = {};
      if (supplierIds.length > 0) {
        const { data: suppliers } = await supabase
          .from('profiles_public')
          .select('id, business_name, avatar_url')
          .in('id', supplierIds);

        (suppliers || []).forEach(s => {
          suppliersMap[s.id] = { id: s.id, business_name: s.business_name || '', avatar_url: s.avatar_url || '' };
        });
      }

      const formattedProducts = (data || []).map(product => ({
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
          id: product.supplier_id || '',
          business_name: suppliersMap[product.supplier_id!]?.business_name || '',
          full_name: '',
          city: '',
          state: '',
          avatar_url: suppliersMap[product.supplier_id!]?.avatar_url || ''
        }
      }));

      setProducts((formattedProducts && formattedProducts.length) ? formattedProducts as any : (generateEquineMockProducts(50) as any));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Filter by category first
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    // Then filter by search query if exists
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query) ||
      (product.category || '').toLowerCase().includes(query) ||
      ((product.supplier?.business_name) || '').toLowerCase().includes(query) ||
      ((product.supplier?.full_name) || '').toLowerCase().includes(query)
    );
  });

  const handleSupplierClick = (supplierId: string) => {
    navigate(`/supplier/${supplierId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-muted"></div>
            <CardContent className="p-2 space-y-1">
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">
          {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? 'Tente buscar por outros termos ou explore todos os produtos'
            : 'Os fornecedores ainda não cadastraram produtos'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg md:text-2xl font-bold">
          {searchQuery 
            ? `Resultados para "${searchQuery}"` 
            : selectedCategory 
              ? getCategoryLabel(selectedCategory) || 'Produtos'
              : 'Todos os Produtos'
          }
        </h2>
        <Badge variant="secondary" className="text-xs md:text-sm w-fit">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentUserId={currentUser?.id}
            onProductClick={(productId) => navigate(`/product/${productId}`)}
            categories={categories}
          />
        ))}
      </div>
    </div>
  );
}