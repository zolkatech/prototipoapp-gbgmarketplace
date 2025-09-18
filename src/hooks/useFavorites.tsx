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
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          products (
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
            installment_options,
            profiles_public!products_supplier_id_fkey (
              id,
              business_name,
              avatar_url,
              bio
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('Favorites query result:', { data, error });

      if (error) {
        console.error('Favorites query error:', error);
        throw error;
      }

      // Filter out any favorites where products is null (deleted products)
      const validFavorites = (data || []).filter((fav: any) => fav.products && fav.products.id);
      
      console.log('Valid favorites after filtering:', validFavorites);
      return validFavorites;
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