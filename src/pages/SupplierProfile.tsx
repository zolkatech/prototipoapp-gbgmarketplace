import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Star, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SupplierData {
  id: string;
  business_name: string;
  bio: string;
  avatar_url: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  client_name: string;
  created_at: string;
}

function SupplierProfileContent() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  // const { toast } = useToast(); // Removed since we're using direct import
  
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (supplierId) {
      fetchSupplierData();
      fetchProducts();
      fetchReviews();
      if (user && profile?.user_type === 'cliente') {
        checkExistingReview();
      }
    }
  }, [supplierId, user, profile]);

  const fetchSupplierData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (error) throw error;
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast({
        title: "Erro",
        description: "Fornecedor não encontrado.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        client_name: 'Cliente',
        created_at: review.created_at
      })) || [];

      setReviews(formattedReviews);
      
      // Calculate average rating
      if (formattedReviews.length > 0) {
        const avg = formattedReviews.reduce((sum, review) => sum + review.rating, 0) / formattedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('client_id', profile?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const reviewData = {
          id: data.id,
          rating: data.rating,
          comment: data.comment || '',
          client_name: profile?.full_name || 'Cliente',
          created_at: data.created_at
        };
        setExistingReview(reviewData);
        setNewReview({ rating: data.rating, comment: data.comment || '' });
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!profile || profile.user_type !== 'cliente') {
      toast({
        title: "Erro",
        description: "Apenas clientes podem deixar avaliações.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: newReview.rating,
            comment: newReview.comment
          })
          .eq('id', existingReview.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a avaliação.",
          variant: "destructive"
        });
        throw error;
      }

        toast({
          title: "Avaliação atualizada!",
          description: "Sua avaliação foi atualizada com sucesso."
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            supplier_id: supplierId,
            client_id: profile.id,
            rating: newReview.rating,
            comment: newReview.comment
          });

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível enviar a avaliação.",
            variant: "destructive"
          });
          throw error;
        }

        toast({
          title: "Avaliação enviada!",
          description: "Sua avaliação foi enviada com sucesso."
        });
      }

      fetchReviews();
      checkExistingReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a avaliação.",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'text-primary fill-current' 
            : 'text-muted-foreground'
        } ${interactive ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={interactive ? () => onRatingChange?.(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-golden">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Supplier Info */}
        <Card className="shadow-golden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24 mx-auto md:mx-0">
                  <AvatarImage src={supplier.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {(supplier.business_name || 'F').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {supplier.business_name || 'Fornecedor'}
                    </h1>
                  
                  
                  {reviews.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating} ({reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''})
                      </span>
                    </div>
                  )}
                </div>
                
                {supplier.bio && (
                  <p className="text-muted-foreground">{supplier.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Produtos</h2>
            <Badge variant="secondary">
              {products.length} produto{products.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden shadow-soft hover:shadow-golden transition-shadow">
                  {product.image_url && (
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-lg font-bold">
                      R$ {product.price.toFixed(2)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Este fornecedor ainda não cadastrou produtos
              </p>
            </Card>
          )}
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Avaliações</h2>

          {/* Add/Edit Review (only for clients) */}
          {profile?.user_type === 'cliente' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  {existingReview ? 'Editar sua avaliação' : 'Deixar uma avaliação'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nota</label>
                    <div className="flex gap-1">
                      {renderStars(
                        newReview.rating, 
                        true, 
                        (rating) => setNewReview(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comentário (opcional)</label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Conte sobre sua experiência com este fornecedor..."
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleSubmitReview} className="w-full">
                    {existingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{review.client_name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-muted-foreground">"{review.comment}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Este fornecedor ainda não possui avaliações
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SupplierProfile() {
  return (
    <AuthProvider>
      <SupplierProfileContent />
    </AuthProvider>
  );
}