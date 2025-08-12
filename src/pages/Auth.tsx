import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'fornecedor' | 'cliente'>('cliente');
  const [signupEmail, setSignupEmail] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownSeconds = 120;
  const [resendLoading, setResendLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message.includes('Invalid') 
          ? "Email ou senha incorretos. Verifique seus dados e tente novamente."
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para seu dashboard...",
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!signupEmail) return;
    setResendLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast({
        title: 'Email reenviado',
        description: 'Confira sua caixa de entrada e a pasta de spam.',
      });
      setResendCooldown(cooldownSeconds);
    } catch (error: any) {
      toast({
        title: 'Não foi possível reenviar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    setSignupEmail(email);
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = (formData.get('phone') as string) || '';
    const whatsapp = (formData.get('whatsapp') as string) || '';
    const city = (formData.get('city') as string) || '';
    const state = (formData.get('state') as string) || '';
    const cpf_cnpj = (formData.get('cpf_cnpj') as string) || '';
    const specialties = (formData.get('specialties') as string) || '';

    const { error } = await signUp(email, password, fullName, userType, {
      phone,
      whatsapp,
      city,
      state,
      cpf_cnpj,
      specialties,
    });
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message.includes('already registered') 
          ? "Este email já está cadastrado. Tente fazer login ou use outro email."
          : error.message.includes('Password') 
          ? "A senha deve ter pelo menos 6 caracteres."
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu email para confirmar a conta e começar a usar a plataforma.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/7f3cfba1-f443-4843-a8f0-f340b1f5c5a8.png" 
              alt="GBG Marketplace Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight gradient-text mb-3">
            GBG Marketplace
          </h1>
          <p className="text-muted-foreground text-base">
            Acesse sua conta ou crie uma nova
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger value="signin" className="data-[state=active]:bg-background">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-background">
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-semibold">
                  Fazer Login
                </CardTitle>
                <CardDescription className="text-base">
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Digite sua senha"
                      required
                      className="h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-semibold">
                  Criar Conta
                </CardTitle>
                <CardDescription className="text-base">
                  Cadastre-se para começar a usar nossa plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signupEmail"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="h-11"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium">Senha</Label>
                    <Input
                      id="signupPassword"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="(11) 9999-9999" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                      <Input id="whatsapp" name="whatsapp" type="tel" placeholder="11999999999" className="h-11" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                      <Input id="city" name="city" type="text" placeholder="Sua cidade" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">Estado</Label>
                      <Input id="state" name="state" type="text" placeholder="UF" className="h-11" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf_cnpj" className="text-sm font-medium">CPF/CNPJ</Label>
                      <Input id="cpf_cnpj" name="cpf_cnpj" type="text" placeholder="Digite seu CPF ou CNPJ" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialties" className="text-sm font-medium">Especialidades</Label>
                      <Input id="specialties" name="specialties" type="text" placeholder="Ex: sela, casqueamento" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Tipo de Conta</Label>
                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'fornecedor' | 'cliente')}>
                      <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="cliente" id="cliente" className="mt-0.5" />
                        <Label htmlFor="cliente" className="flex-1 cursor-pointer">
                          <div className="font-medium text-base">Cliente</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Quero encontrar e comprar produtos equinos
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="fornecedor" id="fornecedor" className="mt-0.5" />
                        <Label htmlFor="fornecedor" className="flex-1 cursor-pointer">
                          <div className="font-medium text-base">Fornecedor</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Quero vender meus produtos na plataforma
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cadastrando...
                      </div>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                  
                  <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Você receberá um email de confirmação após o cadastro. Verifique também sua caixa de spam.
                    </p>
                    {showResend && (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm">Não recebeu seu email?</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={resendLoading || resendCooldown > 0}
                        >
                          {resendLoading
                            ? 'Enviando...'
                            : resendCooldown > 0
                              ? `Reenviar em ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')}`
                              : 'Reenviar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Seus dados estão protegidos conosco</p>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}