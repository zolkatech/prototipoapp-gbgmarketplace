import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import { Camera, User, MapPin, Phone, MessageCircle, Globe, Instagram, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPhoneDisplay, formatWhatsAppNumber, validateBrazilianWhatsApp, getWhatsAppFullNumber } from '@/lib/whatsapp-utils';

function ProfileContent() {
  const { profile, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    bio: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    whatsapp: '',
    website: '',
    instagram: '',
    cep: '',
    cpf_cnpj: '',
    specialties_text: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        business_name: profile.business_name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        state: profile.state || '',
        address: profile.address || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        cep: profile.cep || '',
        cpf_cnpj: profile.cpf_cnpj || '',
        specialties_text: Array.isArray(profile.specialties) ? profile.specialties.join(', ') : ''
      });
    }
  }, [profile]);

  if (authLoading) {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWhatsAppBlur = () => {
    // Aplica formatação apenas quando o usuário sai do campo
    if (formData.whatsapp) {
      const formatted = formatWhatsAppNumber(formData.whatsapp);
      setFormData(prev => ({ ...prev, whatsapp: formatted }));
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar atualizado!",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar a foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const specialtiesArray = formData.specialties_text
        ? formData.specialties_text.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const updateData: any = {
        full_name: formData.full_name,
        business_name: formData.business_name,
        bio: formData.bio,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        website: formData.website,
        instagram: formData.instagram,
        cep: formData.cep,
        cpf_cnpj: formData.cpf_cnpj,
        specialties: specialtiesArray
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Volta se houver histórico; caso contrário, vai para o marketplace
    // React Router v6 expõe o índice pelo history.state.idx
    if ((window.history.state && window.history.state.idx > 0) || document.referrer) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader userProfile={profile} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e de contato</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {(profile?.business_name || profile?.full_name || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    Alterar Foto
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              <div className="text-center space-y-1">
                <Badge variant="secondary">
                  {profile?.user_type === 'fornecedor' ? 'Fornecedor' : 'Cliente'}
                </Badge>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Mantenha suas informações atualizadas para melhor experiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_name">Nome do Negócio</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Conte um pouco sobre você ou seu negócio"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Sua cidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="UF"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                      <Input
                        id="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                        placeholder="Digite seu CPF ou CNPJ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialties_text">Especialidades (separe por vírgula)</Label>
                      <Input
                        id="specialties_text"
                        value={formData.specialties_text}
                        onChange={(e) => handleInputChange('specialties_text', e.target.value)}
                        placeholder="Ex: sela, casqueamento, ferrageamento"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(11) 9999-9999"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500 text-sm">+55</span>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          onBlur={handleWhatsAppBlur}
                          placeholder="11999999999"
                          className="pl-12"
                        />
                        {formData.whatsapp && (
                          <div className="mt-1 text-xs">
                            {validateBrazilianWhatsApp(formData.whatsapp) ? (
                              <span className="text-green-600">✓ Número válido</span>
                            ) : (
                              <span className="text-orange-500">⚠ Digite um número completo</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://seusite.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          placeholder="@seuusuario"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}