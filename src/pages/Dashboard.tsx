import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import SupplierDashboard from '@/components/SupplierDashboard';
import ClientDashboard from '@/components/ClientDashboard';
import WelcomeDialog from '@/components/WelcomeDialog';
import { supabase } from '@/integrations/supabase/client';

function DashboardContent() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile && profile.first_login) {
      setShowWelcome(true);
    }
  }, [profile]);

  const handleWelcomeClose = async () => {
    setShowWelcome(false);
    
    // Marcar que o usuário já viu a mensagem de boas-vindas
    if (profile && profile.first_login) {
      try {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('user_id', user?.id);
        
        // Atualizar o perfil local
        await refreshProfile();
      } catch (error) {
        console.error('Error updating first_login:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.user_type === 'fornecedor' ? (
        <SupplierDashboard />
      ) : (
        <ClientDashboard />
      )}
      
      <WelcomeDialog
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        userType={profile.user_type}
        userName={profile.full_name}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}