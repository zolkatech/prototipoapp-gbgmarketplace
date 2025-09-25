import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, MessageCircle, Eye } from 'lucide-react';
import { generateWhatsAppURL } from '@/lib/whatsapp-utils';

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

interface SupplierCardProps {
  supplier: Supplier;
  onClick: () => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onClick }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.round(rating) 
            ? 'text-primary fill-current' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, we'll just redirect to the profile where the WhatsApp button is available
    onClick();
  };

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-golden transition-all duration-300 cursor-pointer group">
      <CardContent className="p-0">
        <div onClick={onClick} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={supplier.avatar_url} />
              <AvatarFallback className="text-lg">
                {(supplier.business_name || 'F').charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                {supplier.business_name || 'Fornecedor'}
              </h3>
              {supplier.full_name && (
                <p className="text-muted-foreground truncate">{supplier.full_name}</p>
              )}
              
              {/* Location */}
              {(supplier.city || supplier.state) && (
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {[supplier.city, supplier.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {supplier.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {supplier.bio}
            </p>
          )}

          {/* Specialties */}
          {supplier.specialties && supplier.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {supplier.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {supplier.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.specialties.length - 3} mais
                </Badge>
              )}
            </div>
          )}

          {/* Rating */}
          {supplier.review_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(supplier.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {supplier.rating} ({supplier.review_count} avaliação{supplier.review_count !== 1 ? 'ões' : ''})
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClick}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Perfil
            </Button>
            <Button 
              size="sm" 
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;