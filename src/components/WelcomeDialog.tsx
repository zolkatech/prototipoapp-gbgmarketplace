import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserCheck, ArrowRight } from 'lucide-react';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'fornecedor' | 'cliente';
  userName?: string;
}

export default function WelcomeDialog({ isOpen, onClose, userType, userName }: WelcomeDialogProps) {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-semibold">
            Bem-vindo{userName ? `, ${userName.split(' ')[0]}` : ''}!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {userType === 'fornecedor' 
              ? 'Sua conta de fornecedor foi criada com sucesso! Para começar a vender seus produtos, recomendamos completar suas informações de perfil.'
              : 'Sua conta foi criada com sucesso! Para uma melhor experiência na plataforma, recomendamos completar suas informações de perfil.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleCompleteProfile} className="w-full">
            <ArrowRight className="w-4 h-4 mr-2" />
            Completar Perfil
          </Button>
          <Button variant="outline" onClick={handleContinue} className="w-full">
            Continuar Depois
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Você pode completar seu perfil a qualquer momento através do menu de configurações.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}