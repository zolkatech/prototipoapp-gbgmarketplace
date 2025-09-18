import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseFavoritesProps {
  userId?: string;
  productId?: string;
}

export function useFavorites({ userId, productId }: UseFavoritesProps = {}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Verificar se o produto é favorito
  useEffect(() => {
    if (userId && productId) {
      checkIfFavorite();
    }
  }, [userId, productId]);

  const checkIfFavorite = async () => {
    if (!userId || !productId) return;
    
    // Skip check for mock products that don't exist in database
    if (productId.startsWith('mock-')) {
      setIsFavorite(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        console.error('Error checking favorite:', error);
        return;
      }

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para favoritar produtos.',
        variant: 'destructive'
      });
      return;
    }

    if (!productId) {
      toast({
        title: 'Erro',
        description: 'Produto não identificado.',
        variant: 'destructive'
      });
      return;
    }

    // Skip operation for mock products
    if (productId.startsWith('mock-')) {
      toast({
        title: 'Produto não disponível',
        description: 'Este produto é apenas um exemplo e não pode ser favoritado.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: 'Produto removido dos favoritos',
          description: 'O produto foi removido da sua lista de favoritos.',
        });
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            product_id: productId
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: 'Produto favoritado',
          description: 'O produto foi adicionado à sua lista de favoritos.',
        });
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os favoritos. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFavorites = async (userId: string) => {
    try {
      console.log('Getting favorites for user ID:', userId);
      
      // First, get all favorites for the user
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Favorites query error:', favoritesError);
        throw favoritesError;
      }

      if (!favoritesData || favoritesData.length === 0) {
        console.log('No favorites found for user');
        return [];
      }

      // Get all product IDs
      const productIds = favoritesData.map(fav => fav.product_id);
      
      // Fetch products data
      const { data: productsData, error: productsError } = await supabase
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
          installment_options
        `)
        .in('id', productIds);

      if (productsError) {
        console.error('Products query error:', productsError);
        throw productsError;
      }

      // Get unique supplier IDs
      const supplierIds = [...new Set(productsData?.map(p => p.supplier_id).filter(Boolean))];
      
      // Fetch suppliers data
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('profiles_public')
        .select('id, business_name, avatar_url, bio')
        .in('id', supplierIds);

      if (suppliersError) {
        console.error('Suppliers query error:', suppliersError);
        // Don't throw error for suppliers, just continue without supplier data
      }

      // Combine all data
      const result = favoritesData.map(favorite => {
        const product = productsData?.find(p => p.id === favorite.product_id);
        if (!product) {
          console.warn('Product not found for favorite:', favorite.product_id);
          return null;
        }

        const supplier = suppliersData?.find(s => s.id === product.supplier_id);

        return {
          id: favorite.id,
          product_id: favorite.product_id,
          created_at: favorite.created_at,
          products: {
            ...product,
            profiles_public: supplier || null
          }
        };
      }).filter(Boolean); // Remove null entries

      console.log('Combined favorites result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  };

  return {
    isFavorite,
    loading,
    toggleFavorite,
    getFavorites,
    checkIfFavorite
  };
}