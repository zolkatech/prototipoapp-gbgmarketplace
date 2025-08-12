import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import ProductCard from '@/components/ProductCard';
import MarketplaceHeader from '@/components/MarketplaceHeader';

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

function FavoritesContent() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const { getFavorites } = useFavorites();
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
    console.log('Favorites useEffect triggered', { user: !!user, profile });
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile?.id) {
      console.log('About to fetch favorites for profile ID:', profile.id);
      fetchFavorites();
    }
  }, [user, profile, navigate]);

  const fetchFavorites = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      console.log('Fetching favorites for profile ID:', profile.id);
      
      const favorites = await getFavorites(profile.id);
      console.log('Raw favorites data:', favorites);
      
      const formattedProducts = favorites.map((fav: any) => ({
        id: fav.products.id,
        name: fav.products.name,
        description: fav.products.description || '',
        price: fav.products.price,
        image_url: fav.products.image_url || '',
        images: fav.products.images || [],
        category: fav.products.category || '',
        discount_percentage: fav.products.discount_percentage || 0,
        original_price: fav.products.original_price || null,
        delivery_locations: fav.products.delivery_locations || [],
        delivers: fav.products.delivers ?? true,
        supplier: {
          id: fav.products.profiles_public?.id || '',
          business_name: fav.products.profiles_public?.business_name || '',
          full_name: '',
          city: '',
          state: '',
          avatar_url: fav.products.profiles_public?.avatar_url || ''
        }
      }));

      console.log('Formatted products:', formattedProducts);
      setFavoriteProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketplaceHeader 
          showCategories={false}
          userProfile={profile}
          onSignOut={signOut}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-gray-300"></div>
                  <CardContent className="p-3 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader 
        showCategories={false}
        userProfile={profile}
        onSignOut={signOut}
      />
      
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
            Dashboard / Meus Favoritos
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Meus Favoritos
            </h1>
            <Badge variant="secondary" className="text-sm">
              {favoriteProducts.length} produto{favoriteProducts.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {favoriteProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  Nenhum produto favoritado
                </h3>
                <p className="text-gray-500 mb-4">
                  Você ainda não adicionou nenhum produto aos seus favoritos.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Explorar produtos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentUserId={profile?.id}
                  onProductClick={(productId) => navigate(`/product/${productId}`)}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Favorites() {
  return (
    <AuthProvider>
      <FavoritesContent />
    </AuthProvider>
  );
}