import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, MapPin, ShoppingCart, Heart, Bell, LogOut, Menu, User, Settings, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MarketplaceHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showCategories?: boolean;
  showSearch?: boolean;
  userProfile?: {
    full_name?: string;
    business_name?: string;
    avatar_url?: string;
    cep?: string;
    user_type?: string;
  } | null;
  onSignOut?: () => void;
}

export default function MarketplaceHeader({ 
  searchQuery = '', 
  onSearchChange, 
  showCategories = true,
  showSearch = true,
  userProfile = null,
  onSignOut
}: MarketplaceHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="bg-primary shadow-golden sticky top-0 z-50">
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full p-1 shadow-soft">
                <img 
                  src="/lovable-uploads/7f3cfba1-f443-4843-a8f0-f340b1f5c5a8.png" 
                  alt="Logo GBG Conecta" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-base md:text-lg font-bold text-primary-foreground">
                <span className="block md:inline">GBG</span>
                <span className="text-xs md:text-sm font-normal block md:inline">
                  {!isMobile && <br />}Marketplace
                </span>
              </h1>
            </div>

            {/* Desktop Search Bar */}
            {!isMobile && showSearch && (
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Input
                    placeholder="Buscar serviços e produtos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-4 pr-12 h-10 bg-white border-0 shadow-sm text-gray-700 placeholder:text-gray-500"
                  />
                  <Button 
                    size="sm" 
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Search Button */}
            {isMobile && showSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="text-primary-foreground hover:bg-white/20 p-2"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* User Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* CEP Info - Only on desktop */}
              {!isMobile && (
                <div className="flex items-center gap-2 text-primary-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Meu CEP</span>
                  <span className="text-sm font-medium">
                    {userProfile?.cep || 'Não informado'}
                  </span>
                </div>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-lg text-primary-foreground">
                    <Avatar className="w-6 h-6 md:w-8 md:h-8">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-white text-foreground text-xs">
                        {userProfile ? (userProfile.business_name || userProfile.full_name || 'U').charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-sm font-medium text-primary-foreground">
                        Minha conta
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white z-50">
                  {userProfile ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      {userProfile.user_type !== 'fornecedor' && (
                        <DropdownMenuItem onClick={() => navigate('/favorites')} className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Favoritos
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 text-red-600">
                        <LogOut className="w-4 h-4" />
                        Sair
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/auth')} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Entrar / Cadastrar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobile && showSearch && showMobileSearch && (
            <div className="mt-3 pb-2">
              <div className="relative">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-4 pr-12 h-10 bg-white border-0 shadow-sm text-gray-700 placeholder:text-gray-500"
                />
                <Button 
                  size="sm" 
                  className="absolute right-1 top-1 h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}