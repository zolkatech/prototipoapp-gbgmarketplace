import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MarketplaceHeader from './MarketplaceHeader';
import ProductFeed from './client/ProductFeed';
import InstagramFeed from './client/InstagramFeed';
import { supabase } from '@/integrations/supabase/client';

export default function ClientDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<{id: string} | null>(null);
  const { signOut, profile } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .rpc('get_current_user_profile')
          .maybeSingle();
        
        if (profileData) {
          setCurrentUser({ id: (profileData as any).id });
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showCategories={false}
        userProfile={profile}
        onSignOut={signOut}
      />




      {/* Feed or Marketplace */}
      <main className="lg:container mx-auto px-0 lg:px-4 py-4 lg:py-8">
        {searchQuery ? (
          <ProductFeed searchQuery={searchQuery} />
        ) : (
          <InstagramFeed />
        )}
      </main>
    </div>
  );
}