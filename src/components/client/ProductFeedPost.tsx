import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ProductFeedPostProps {
  product: {
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
  };
  compact?: boolean;
}

export default function ProductFeedPost({ product, compact = false }: ProductFeedPostProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchLikes();
      fetchComments();
    }
  }, [product.id, profile?.id]);

  const fetchLikes = async () => {
    try {
      // Verificar se o usuário curtiu este produto
      const { data: userLike } = await supabase
        .from('product_likes')
        .select('id')
        .eq('product_id', product.id)
        .eq('user_id', profile!.id)
        .maybeSingle();

      setLiked(!!userLike);

      // Contar total de curtidas
      const { count } = await supabase
        .from('product_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id);

      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('product_comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = data?.map(comment => comment.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, business_name, avatar_url')
        .in('id', userIds);

      const formattedComments = data?.map(comment => {
        const userProfile = profiles?.find(p => p.id === comment.user_id);
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            full_name: (userProfile?.business_name && userProfile.business_name.trim()) ? userProfile.business_name : 'Usuário',
            avatar_url: userProfile?.avatar_url
          }
        };
      }) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleLike = async () => {
    if (!profile?.id) return;

    try {
      if (liked) {
        await supabase
          .from('product_likes')
          .delete()
          .eq('product_id', product.id)
          .eq('user_id', profile.id);
        
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('product_likes')
          .insert({
            product_id: product.id,
            user_id: profile.id
          });
        
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível curtir o produto",
        variant: "destructive"
      });
    }
  };

  const addComment = async () => {
    if (!profile?.id || !newComment.trim()) return;

    try {
      await supabase
        .from('product_comments')
        .insert({
          product_id: product.id,
          user_id: profile.id,
          content: newComment.trim()
        });

      setNewComment('');
      fetchComments();
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive"
      });
    }
  };

  const displayName = product.supplier.business_name || product.supplier.full_name || 'Fornecedor';
  const mainImage = product.images?.[0] || product.image_url || '/placeholder.svg';
  const extraCount = Math.max((product.images?.length || 0) - 1, 0);

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description || product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copiado', description: 'URL do produto copiada para a área de transferência' });
      }
    } catch (err) {
      toast({ title: 'Não foi possível compartilhar', description: 'Tente novamente mais tarde', variant: 'destructive' });
    }
  };

  const handleSupplierClick = () => {
    navigate(`/supplier/${product.supplier.id}`);
  };

  return (
    <div className={`bg-card rounded-lg shadow-sm border ${compact ? 'max-w-sm' : ''}`}>
      {/* Header do post */}
      <div className={`${compact ? 'p-2' : 'p-4'} flex items-center gap-3`}>
        <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarImage 
            src={product.supplier.avatar_url || undefined} 
            alt={displayName}
          />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div 
            className={`${compact ? 'font-medium text-[11px] text-muted-foreground hover:text-primary' : 'font-semibold text-sm hover:text-primary'} truncate cursor-pointer transition-colors flex items-center gap-1 group`}
            onClick={handleSupplierClick}
            title="Ver perfil do fornecedor"
          >
            {displayName}
            <Star className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {product.supplier.city && (
            <div className={`${compact ? 'text-xs' : 'text-xs'} text-muted-foreground truncate`}>{product.supplier.city}</div>
          )}
        </div>
        {!compact && (
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(product.created_at), { addSuffix: true, locale: ptBR })}
          </div>
        )}
      </div>

      {/* Imagem do produto */}
      <div className={`relative ${compact ? 'aspect-square' : 'aspect-square'} bg-muted`}>
        <Link to={`/product/${product.id}`} aria-label={`Ver detalhes de ${product.name}`}>
          <img
            src={mainImage}
            alt={`Foto de ${product.name}`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </Link>
        {extraCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
            +{extraCount}
          </div>
        )}
      </div>

      {/* Ações (curtir, comentar, etc) */}
      <div className={`${compact ? 'p-2' : 'p-4'} space-y-3`}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={`flex items-center gap-2 p-0 h-auto ${liked ? 'text-red-500' : ''}`}
          >
            <Heart className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${liked ? 'fill-current' : ''}`} />
            <span className={compact ? 'text-xs' : 'text-sm'}>{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (compact) setCommentsOpen(true); else setShowComments(!showComments); }}
            className="flex items-center gap-2 p-0 h-auto"
          >
            <MessageCircle className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
            <span className={compact ? 'text-xs' : 'text-sm'}>{comments.length}</span>
          </Button>

          {!compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 p-0 h-auto ml-auto"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Informações do produto */}
        {!compact && (
          <div>
            <h3 className={`font-semibold text-lg mb-1 line-clamp-1`}>{product.name}</h3>
            {product.description && (
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xl font-bold text-primary`}>
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  {product.discount_percentage && (
                    <Badge variant="destructive" className="text-xs">
                      -{product.discount_percentage}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            <Badge variant="secondary" className={'text-xs'}>
              {product.category}
            </Badge>
          </div>
        )}

        {/* Seção de comentários */}
        {showComments && (
          <div className="space-y-3 border-t pt-3">
            {/* Lista de comentários */}
            {comments.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={comment.user?.avatar_url || undefined} 
                        alt={comment.user?.full_name || 'Usuário'}
                      />
                      <AvatarFallback className="text-xs">
                        {(comment.user?.full_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-semibold mr-2">
                          {comment.user?.full_name || 'Usuário'}
                        </span>
                        <span>{comment.content}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input para novo comentário */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={profile?.avatar_url || undefined} 
                  alt={profile?.full_name || 'Você'}
                />
                <AvatarFallback className="text-xs">
                  {(profile?.full_name || 'V').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Input
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  className="pr-12"
                />
                <Button
                  size="sm"
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Modal de comentários para cards compactos */}
        <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Comentários</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {comments.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.user?.avatar_url || undefined} alt={comment.user?.full_name || 'Usuário'} />
                        <AvatarFallback className="text-xs">{(comment.user?.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold mr-2">{comment.user?.full_name || 'Usuário'}</span>
                          <span>{comment.content}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Você'} />
                  <AvatarFallback className="text-xs">{(profile?.full_name || 'V').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    className="pr-12"
                  />
                  <Button size="sm" onClick={addComment} disabled={!newComment.trim()} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}