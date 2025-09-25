import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import SupplierCard from '@/components/SupplierCard';
import SupplierFilters from '@/components/SupplierFilters';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';

interface Supplier {
  id: string;
  business_name: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  state: string;
  specialties: string[];
  rating: number;
  review_count: number;
}

interface FilterState {
  searchQuery: string;
  city: string;
  state: string;
  specialty: string;
  minRating: number;
}

function SupplierSearchContent() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    city: '',
    state: '',
    specialty: '',
    minRating: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, [filters]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      
      // Build the query based on filters
      let query = supabase
        .from('profiles')
        .select(`
          id,
          business_name,
          full_name,
          bio,
          avatar_url,
          city,
          state,
          specialties
        `)
        .eq('user_type', 'fornecedor')
        .not('business_name', 'is', null);

      // Apply filters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      
      if (filters.searchQuery) {
        query = query.or(`business_name.ilike.%${filters.searchQuery}%,full_name.ilike.%${filters.searchQuery}%,bio.ilike.%${filters.searchQuery}%`);
      }

      if (filters.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      const { data: suppliersData, error } = await query.order('business_name');

      if (error) throw error;

      // Fetch ratings for each supplier
      const suppliersWithRatings = await Promise.all(
        (suppliersData || []).map(async (supplier) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('supplier_id', supplier.id);

          const ratings = reviews || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
            : 0;

          return {
            ...supplier,
            rating: Math.round(avgRating * 10) / 10,
            review_count: ratings.length
          };
        })
      );

      // Apply rating filter
      const filteredSuppliers = suppliersWithRatings.filter(
        supplier => supplier.rating >= filters.minRating
      );

      setSuppliers(filteredSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketplaceHeader userProfile={profile} showCategories={false} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando fornecedores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader 
        userProfile={profile} 
        showCategories={false}
        searchQuery={filters.searchQuery}
        onSearchChange={(value) => handleFilterChange({ searchQuery: value })}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buscar Fornecedores</h1>
          <p className="text-muted-foreground">
            Encontre os melhores fornecedores e ferradores da sua região
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SupplierFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">
                  {suppliers.length} fornecedor{suppliers.length !== 1 ? 'es' : ''} encontrado{suppliers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    onClick={() => navigate(`/supplier/${supplier.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Nenhum fornecedor encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros para encontrar mais resultados
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const SupplierSearch = () => {
  return <SupplierSearchContent />;
};

export default SupplierSearch;