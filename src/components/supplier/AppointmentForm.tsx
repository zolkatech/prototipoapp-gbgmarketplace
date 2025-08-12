import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  name: string;
  species: string;
}

interface AppointmentFormProps {
  clientId: string;
  clientName: string;
  onAppointmentAdded: () => void;
}

export default function AppointmentForm({ clientId, clientName, onAppointmentAdded }: AppointmentFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [formData, setFormData] = useState({
    animal_id: '',
    appointment_date: '',
    appointment_time: '',
    service_type: '',
    description: '',
    observations: '',
    price: '',
    location: '',
    status: 'agendado'
  });

  useEffect(() => {
    if (open) {
      fetchAnimals();
    }
  }, [open, clientId]);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('client_animals')
        .select('id, name, species')
        .eq('client_id', clientId);

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const appointmentDateTime = formData.appointment_date && formData.appointment_time 
        ? `${formData.appointment_date}T${formData.appointment_time}:00.000Z`
        : new Date().toISOString();

      const { error } = await supabase
        .from('client_appointments')
        .insert({
          client_id: clientId,
          supplier_id: profile.id,
          animal_id: formData.animal_id || null,
          appointment_date: appointmentDateTime,
          service_type: formData.service_type,
          description: formData.description,
          observations: formData.observations,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location || null,
          status: formData.status
        });

      if (error) throw error;

      toast({
        title: "Atendimento registrado!",
        description: "O atendimento foi adicionado ao histórico."
      });

      setFormData({
        animal_id: '',
        appointment_date: '',
        appointment_time: '',
        service_type: '',
        description: '',
        observations: '',
        price: '',
        location: '',
        status: 'agendado'
      });
      setOpen(false);
      onAppointmentAdded();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar o atendimento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Atendimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Registrar Atendimento
          </DialogTitle>
          <DialogDescription>
            Adicionar novo atendimento para {clientName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animal_id">Animal (opcional)</Label>
            <Select value={formData.animal_id} onValueChange={(value) => handleInputChange('animal_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um animal ou deixe em branco" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Data do Atendimento</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time">Horário</Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange('appointment_time', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Endereço, clínica, domicílio, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Serviço *</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) => handleInputChange('service_type', e.target.value)}
              placeholder="Ex: Consulta, Vacina, Banho e Tosa, Cirurgia..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Atendimento</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o atendimento realizado..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações importantes, medicamentos prescritos, retorno..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0,00"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}