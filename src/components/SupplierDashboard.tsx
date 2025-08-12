import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User, Package, Users, BarChart3, Eye, ArrowLeft, Menu, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import MarketplaceHeader from './MarketplaceHeader';
import ClientDashboard from './ClientDashboard';
import SupplierProfile from './supplier/SupplierProfile';
import SupplierProducts from './supplier/SupplierProducts';
import SupplierClients from './supplier/SupplierClients';
import SupplierFinancial from './supplier/SupplierFinancial';
import SupplierAgenda from './supplier/SupplierAgenda';

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [viewAsClient, setViewAsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, profile } = useAuth();
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'products', label: 'Meus Produtos', icon: Package },
    { id: 'clients', label: 'Meus Clientes', icon: Users },
    { id: 'agenda', label: 'Agenda de Serviços', icon: Calendar },
    { id: 'financial', label: 'Controle Financeiro', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SupplierProfile />;
      case 'products':
        return <SupplierProducts />;
      case 'clients':
        return <SupplierClients />;
      case 'agenda':
        return <SupplierAgenda />;
      case 'financial':
        return <SupplierFinancial />;
      default:
        return <SupplierProfile />;
    }
  };

  // Se estiver vendo como cliente, retorna o ClientDashboard
  if (viewAsClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewAsClient(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Fornecedor
                </Button>
                <div className="text-sm text-muted-foreground">
                  Visualizando como cliente
                </div>
              </div>
            </div>
          </div>
        </div>
        <ClientDashboard />
      </div>
    );
  }

  const NavigationContent = () => (
    <nav className="space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              setActiveTab(tab.id);
              setMobileMenuOpen(false);
            }}
          >
            <Icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        );
      })}
      
      {/* Separador */}
      <div className="border-t my-4"></div>
      
      {/* Botão Ver como Cliente */}
      <Button
        variant="outline"
        className="w-full justify-start text-primary border-primary hover:bg-primary/10"
        onClick={() => {
          setViewAsClient(true);
          setMobileMenuOpen(false);
        }}
      >
        <Eye className="w-4 h-4 mr-2" />
        Ver como Cliente
      </Button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader 
        showCategories={false} 
        showSearch={false}
        userProfile={profile}
        onSignOut={signOut}
      />

      <div className="flex relative">
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="fixed top-20 left-4 z-40">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white shadow-lg">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                </div>
                <NavigationContent />
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 bg-white border-r min-h-[calc(100vh-140px)] p-4 shadow-sm">
            <NavigationContent />
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${isMobile ? 'w-full' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}