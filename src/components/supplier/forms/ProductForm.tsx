import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { productCategories } from '@/utils/categories';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  videos: string[];
  discount_percentage: number;
  original_price: string;
  delivers: boolean;
  delivery_locations: string[];
  installment_options: {
    max_installments: number;
    interest_free_installments: number;
  };
  service_locations: string[];
}

interface ProductFormProps {
  supplierId: string;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  editingProduct: any;
}

const deliveryOptions = [
  'Todo o Brasil',
  'Região Sul',
  'Região Sudeste',
  'Região Centro-Oeste',
  'Região Nordeste',
  'Região Norte',
  'Minha cidade apenas'
];

export default function ProductForm({ supplierId, formData, onFormDataChange, onSubmit, loading, editingProduct }: ProductFormProps) {
  const [newLocation, setNewLocation] = useState('');
  const { toast } = useToast();

  const addLocation = () => {
    if (newLocation.trim() && !formData.delivery_locations.includes(newLocation.trim())) {
      onFormDataChange({
        ...formData,
        delivery_locations: [...formData.delivery_locations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    onFormDataChange({
      ...formData,
      delivery_locations: formData.delivery_locations.filter(loc => loc !== location)
    });
  };

  const updateField = (field: string, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const updateInstallmentField = (field: string, value: number) => {
    onFormDataChange({
      ...formData,
      installment_options: {
        ...formData.installment_options,
        [field]: value
      }
    });
  };

  const handleFiles = async (fileList: FileList | null, type: 'images' | 'videos') => {
    if (!fileList) return;
    const currentCount = type === 'images' ? (formData.images?.length || 0) : (formData.videos?.length || 0);
    const remaining = 3 - currentCount;
    if (remaining <= 0) {
      toast({ 
        title: `Limite de ${type === 'images' ? 'imagens' : 'vídeos'}`, 
        description: `Máximo de 3 ${type === 'images' ? 'imagens' : 'vídeos'} por item.`, 
        variant: 'destructive' 
      });
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isValidType = type === 'images' ? file.type.startsWith('image/') : file.type.startsWith('video/');
      if (!isValidType) continue;
      
      const bucket = type === 'images' ? 'product-images' : 'product-videos';
      const path = `${supplierId}/${Date.now()}-${i}-${file.name}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) {
        console.error(error);
        toast({ 
          title: `Falha ao enviar ${type === 'images' ? 'imagem' : 'vídeo'}`, 
          description: error.message, 
          variant: 'destructive' 
        });
        continue;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }
    if (uploadedUrls.length) {
      const currentFiles = type === 'images' ? (formData.images || []) : (formData.videos || []);
      const updatedFiles = [...currentFiles, ...uploadedUrls].slice(0, 3);
      onFormDataChange({ 
        ...formData, 
        [type]: updatedFiles
      });
    }
  };

  const removeMedia = (url: string, type: 'images' | 'videos') => {
    const currentFiles = type === 'images' ? (formData.images || []) : (formData.videos || []);
    onFormDataChange({ 
      ...formData, 
      [type]: currentFiles.filter((u) => u !== url) 
    });
  };
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: Sela de montaria"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => updateField('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descreva seu produto..."
          rows={3}
          required
        />
      </div>

      {/* Imagens e Vídeos (máx. 3 cada) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Imagens do Produto (máx. 3)</Label>
          <div className="flex items-center gap-3">
            <Input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => handleFiles(e.target.files, 'images')}
              disabled={(formData.images?.length || 0) >= 3}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formData.images?.length || 0}/3 imagens
            </span>
          </div>
          
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {formData.images.map((url, index) => (
                <div key={url} className="relative group">
                  <img 
                    src={url} 
                    alt={`Imagem do produto ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-md border-2 border-gray-200 hover:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                    onClick={() => removeMedia(url, 'images')}
                    aria-label="Remover imagem"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Vídeos do Produto (máx. 3)</Label>
          <div className="flex items-center gap-3">
            <Input 
              type="file" 
              accept="video/*" 
              multiple 
              onChange={(e) => handleFiles(e.target.files, 'videos')}
              disabled={(formData.videos?.length || 0) >= 3}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formData.videos?.length || 0}/3 vídeos
            </span>
          </div>
          
          {formData.videos && formData.videos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {formData.videos.map((url, index) => (
                <div key={url} className="relative group">
                  <video 
                    src={url} 
                    className="w-full h-24 object-cover rounded-md border-2 border-gray-200 hover:border-primary transition-colors"
                    controls={false}
                    muted
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                    onClick={() => removeMedia(url, 'videos')}
                    aria-label="Remover vídeo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="original_price">Preço Original (opcional)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) => updateField('original_price', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_percentage">Desconto (%)</Label>
          <Input
            id="discount_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.discount_percentage}
            onChange={(e) => updateField('discount_percentage', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Opções de parcelamento */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Opções de Parcelamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_installments">Máximo de parcelas</Label>
            <Select 
              value={formData.installment_options.max_installments.toString()} 
              onValueChange={(value) => updateInstallmentField('max_installments', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o máximo de parcelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Não parcelo</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="6">6x</SelectItem>
                <SelectItem value="12">12x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest_free_installments">Parcelas sem juros</Label>
            <Select 
              value={formData.installment_options.interest_free_installments.toString()} 
              onValueChange={(value) => updateInstallmentField('interest_free_installments', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione parcelas sem juros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Não parcelo</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="6">6x</SelectItem>
                <SelectItem value="12">12x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Opções de entrega */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="delivers"
            checked={formData.delivers}
            onCheckedChange={(checked) => updateField('delivers', checked)}
          />
          <Label htmlFor="delivers">Faço entregas</Label>
        </div>

        {formData.delivers && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Locais de entrega</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.delivery_locations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeLocation(location)}
                    />
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Select value={newLocation} onValueChange={setNewLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um local de entrega" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addLocation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </div>
    </form>
  );
}