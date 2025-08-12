import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Phone, MapPin, Mail, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientRegistrationFormProps {
  onClientAdded?: () => void;
  onClientUpdated?: () => void;
  client?: {
    id: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    notes: string;
  };
  trigger?: React.ReactNode;
}
 
export default function ClientRegistrationForm({ onClientAdded, onClientUpdated, client, trigger }: ClientRegistrationFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isEdit = !!client;

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name || '',
          phone: client.phone || '',
          address: client.address || '',
          email: client.email || '',
          notes: client.notes || ''
        });
      } else {
        setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
      }
    }
  }, [open, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && client) {
        const { error } = await supabase
          .from('supplier_clients')
          .update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
            notes: formData.notes,
          })
          .eq('id', client.id);

        if (error) throw error;

        toast({ title: 'Cliente atualizado!', description: 'As informações foram salvas.' });
        setOpen(false);
        onClientUpdated?.();
      } else {
        if (!profile) throw new Error('Perfil não encontrado');
        const { error } = await supabase
          .from('supplier_clients')
          .insert({
            supplier_id: profile.id,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
            notes: formData.notes,
          });

        if (error) throw error;

        toast({ title: 'Cliente cadastrado!', description: 'O cliente foi adicionado com sucesso.' });
        setFormData({ name: '', phone: '', address: '', email: '', notes: '' });
        setOpen(false);
        onClientAdded?.();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: isEdit ? 'Erro ao atualizar' : 'Erro ao cadastrar',
        description: isEdit ? 'Não foi possível atualizar o cliente.' : 'Não foi possível cadastrar o cliente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações do cliente' : 'Adicione um novo cliente à sua lista'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do cliente"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="cliente@email.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações sobre o cliente..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (isEdit ? 'Salvando...' : 'Cadastrando...') : (isEdit ? 'Salvar' : 'Cadastrar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}