import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FilterState {
  searchQuery: string;
  city: string;
  state: string;
  specialty: string;
  minRating: number;
}

interface SupplierFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const commonSpecialties = [
  'Casqueamento',
  'Ferrageamento',
  'Ortopedia Equina',
  'Ferrageamento Ortopédico',
  'Casqueamento Terapêutico',
  'Ferraduras Especiais',
  'Trabalhos de Campo',
  'Competições',
  'Cavalo de Sela',
  'Cavalo de Corrida',
  'Gado',
  'Atendimento Rural',
  'Atendimento Urbano'
];

const SupplierFilters: React.FC<SupplierFiltersProps> = ({ filters, onFilterChange }) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchAvailableCities();
  }, [filters.state]);

  const fetchAvailableCities = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('city')
        .eq('user_type', 'fornecedor')
        .not('city', 'is', null);

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      const { data, error } = await query;

      if (error) throw error;

      const cities = [...new Set(data?.map(p => p.city).filter(Boolean) || [])].sort();
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      city: '',
      state: '',
      specialty: '',
      minRating: 0
    });
  };

  const hasActiveFilters = filters.city || filters.state || filters.specialty || filters.minRating > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            {isCollapsed ? 'Mostrar' : 'Ocultar'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-6 ${isCollapsed ? 'hidden lg:block' : ''}`}>
        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Filtros ativos</span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
        )}

        {/* State Filter */}
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select
            value={filters.state}
            onValueChange={(value) => onFilterChange({ state: value, city: '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os estados</SelectItem>
              {brazilianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Select
            value={filters.city}
            onValueChange={(value) => onFilterChange({ city: value })}
            disabled={!filters.state}
          >
            <SelectTrigger>
              <SelectValue placeholder={filters.state ? "Selecione a cidade" : "Primeiro selecione o estado"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as cidades</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specialty Filter */}
        <div className="space-y-2">
          <Label htmlFor="specialty">Especialidade</Label>
          <Select
            value={filters.specialty}
            onValueChange={(value) => onFilterChange({ specialty: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as especialidades</SelectItem>
              {commonSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Avaliação mínima</Label>
            <Badge variant="secondary">
              {filters.minRating} {filters.minRating === 1 ? 'estrela' : 'estrelas'}
            </Badge>
          </div>
          <Slider
            value={[filters.minRating]}
            onValueChange={(value) => onFilterChange({ minRating: value[0] })}
            max={5}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label>Filtros ativos:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.state && (
                <Badge variant="outline" className="text-xs">
                  Estado: {filters.state}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => onFilterChange({ state: '', city: '' })}
                  />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="outline" className="text-xs">
                  Cidade: {filters.city}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => onFilterChange({ city: '' })}
                  />
                </Badge>
              )}
              {filters.specialty && (
                <Badge variant="outline" className="text-xs">
                  {filters.specialty}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => onFilterChange({ specialty: '' })}
                  />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="outline" className="text-xs">
                  Min. {filters.minRating}★
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => onFilterChange({ minRating: 0 })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierFilters;