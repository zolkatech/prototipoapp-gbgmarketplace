import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import ProductDetail from '@/pages/ProductDetail';

export default function ProductDetailWrapper() {
  return (
    <AuthProvider>
      <ProductDetail />
    </AuthProvider>
  );
}