import React, { useState, useEffect } from 'react';
import { generateEquineMockProducts } from '@/utils/mockData';




import ProductFeedPost from './ProductFeedPost';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url?: string;
  images?: string[];
  category: string;
  created_at: string;
  supplier: {
    id: string;
    full_name?: string;
    business_name?: string;
    avatar_url?: string;
    city?: string;
  };
}

const categories = [
  { value: 'all', label: 'Todas' },
  { value: 'ferramenta', label: 'Ferramentas' },
  { value: 'equipamento', label: 'Equipamentos' },
  { value: 'medicamento', label: 'Medicamentos' },
  { value: 'alimento', label: 'Alimentos' },
  { value: 'servico', label: 'Serviços' },
];

export default function InstagramFeed() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            business_name,
            avatar_url,
            city
          )
        `);

      // Aplicar filtros
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Aplicar ordenação
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProducts = data?.map(product => ({
        ...product,
        supplier: {
          id: product.profiles.id,
          full_name: product.profiles.full_name,
          business_name: product.profiles.business_name,
          avatar_url: product.profiles.avatar_url,
          city: product.profiles.city,
        }
      })) || [];

      setProducts((formattedProducts && formattedProducts.length) ? formattedProducts as any : (generateEquineMockProducts(50) as any));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-6 px-0 lg:px-4">
      {/* Header com busca e filtros */}

      {/* Feed de produtos em grid */}
      <div className="w-full">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Nenhum produto encontrado com os filtros aplicados.'
                : 'Nenhum produto disponível no momento.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0">
            {products.map(product => (
              <ProductFeedPost key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}