import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Star, Phone, MapPin, Mail, ChevronDown, Heart, Calendar, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import ClientRegistrationForm from './ClientRegistrationForm';
import AnimalRegistrationForm from './AnimalRegistrationForm';
import AppointmentForm from './AppointmentForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  notes: string;
  created_at: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  observations: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  description: string;
  observations: string;
  price: number;
  status: string;
  animal_id: string;
  animal_name?: string;
}

interface ReviewClient {
  id: string;
  full_name: string;
  avatar_url: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function SupplierClients() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('registered');
  const [clients, setClients] = useState<Client[]>([]);
  const [reviewClients, setReviewClients] = useState<ReviewClient[]>([]);
  const [clientAnimals, setClientAnimals] = useState<{ [clientId: string]: Animal[] }>({});
  const [clientAppointments, setClientAppointments] = useState<{ [clientId: string]: Appointment[] }>({});
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAnimals: 0,
    totalAppointments: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    await Promise.all([
      fetchClients(),
      fetchReviewClients(),
      fetchStats()
    ]);
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_clients')
        .select('*')
        .eq('supplier_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchReviewClients = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          client_id,
          profiles!reviews_client_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('supplier_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients = data?.map((review: any) => {
        const prof = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
        return {
          id: review.client_id,
          full_name: prof?.full_name || 'Cliente',
          avatar_url: prof?.avatar_url || '',
          rating: review.rating,
          comment: review.comment || '',
          created_at: review.created_at
        };
      }) || [];

      setReviewClients(formattedClients);
    } catch (error) {
      console.error('Error fetching review clients:', error);
    }
  };

  const fetchClientAnimals = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_animals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientAnimals(prev => ({ ...prev, [clientId]: data || [] }));
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const fetchClientAppointments = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      
      setClientAppointments(prev => ({ ...prev, [clientId]: data || [] }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [clientsData, appointmentsData, reviewsData] = await Promise.all([
        supabase.from('supplier_clients').select('id').eq('supplier_id', profile.id),
        supabase.from('client_appointments').select('id').eq('supplier_id', profile.id),
        supabase.from('reviews').select('rating').eq('supplier_id', profile.id)
      ]);

      const totalClients = clientsData.data?.length || 0;
      const totalAppointments = appointmentsData.data?.length || 0;
      const reviews = reviewsData.data || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Get total animals separately
      const animalsData = await supabase
        .from('client_animals')
        .select('id')
        .in('client_id', clients.map(c => c.id));
      
      const totalAnimals = animalsData.data?.length || 0;

      setStats({
        totalClients,
        totalAnimals,
        totalAppointments,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleClientExpanded = async (clientId: string) => {
    const isExpanded = expandedClients.has(clientId);
    const newExpanded = new Set(expandedClients);
    
    if (isExpanded) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
      // Carregar dados do cliente se ainda não foram carregados
      if (!clientAnimals[clientId]) {
        await fetchClientAnimals(clientId);
      }
      if (!clientAppointments[clientId]) {
        await fetchClientAppointments(clientId);
      }
    }
    
    setExpandedClients(newExpanded);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      name: client.name,
      phone: client.phone,
      address: client.address,
      email: client.email,
      notes: client.notes
    });
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;

    try {
      const { error } = await supabase
        .from('supplier_clients')
        .update({
          name: editFormData.name,
          phone: editFormData.phone,
          address: editFormData.address,
          email: editFormData.email,
          notes: editFormData.notes
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado!",
        description: "As informações do cliente foram atualizadas com sucesso."
      });

      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as informações do cliente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('supplier_clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Cliente excluído!",
        description: "O cliente foi excluído com sucesso."
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-primary fill-current' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'agendado': { label: 'Agendado', variant: 'secondary' as const },
      'em_andamento': { label: 'Em Andamento', variant: 'default' as const },
      'concluido': { label: 'Concluído', variant: 'secondary' as const },
      'cancelado': { label: 'Cancelado', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className={isMobile ? "text-center" : ""}>
        <h2 className="text-2xl font-bold">Meus Clientes</h2>
        {!isMobile && (
          <p className="text-muted-foreground">
            Gerencie seus clientes, animais e histórico de atendimentos
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.totalClients}
            </div>
            <p className="text-sm text-muted-foreground">
              Clientes Cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.totalAnimals}
            </div>
            <p className="text-sm text-muted-foreground">
              Animais
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.totalAppointments}
            </div>
            <p className="text-sm text-muted-foreground">
              Atendimentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl font-bold text-primary">
                {stats.averageRating}
              </span>
              <Star className="w-5 h-5 text-primary fill-current" />
            </div>
            <p className="text-sm text-muted-foreground">
              Avaliação Média
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registered">Clientes Cadastrados</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Clientes Cadastrados</h3>
            <ClientRegistrationForm onClientAdded={fetchData} />
          </div>

          {clients.length > 0 ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <Collapsible 
                    open={expandedClients.has(client.id)}
                    onOpenChange={() => toggleClientExpanded(client.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{client.name}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {client.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {client.phone}
                                  </div>
                                )}
                                {client.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {client.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 transition-transform ${
                            expandedClients.has(client.id) ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {/* Informações do Cliente */}
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          {client.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{client.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {client.notes && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-muted-foreground">
                                <strong>Observações:</strong> {client.notes}
                              </p>
                            </div>
                          )}
                        </div>

                         {/* Ações */}
                         <div className="flex flex-wrap gap-2">
                           <div className="w-full sm:w-auto">
                             <AnimalRegistrationForm 
                               clientId={client.id} 
                               onAnimalAdded={() => fetchClientAnimals(client.id)} 
                             />
                           </div>
                           <div className="w-full sm:w-auto">
                             <AppointmentForm 
                               clientId={client.id} 
                               clientName={client.name}
                               onAppointmentAdded={() => fetchClientAppointments(client.id)} 
                             />
                           </div>
                           <div className="w-full sm:w-auto">
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => handleEditClient(client)}
                               className="flex items-center gap-2"
                             >
                               <Edit className="w-4 h-4" />
                               Editar
                             </Button>
                           </div>
                           <div className="w-full sm:w-auto">
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="flex items-center gap-2 text-destructive hover:text-destructive"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                   Excluir
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     Tem certeza que deseja excluir o cliente "{client.name}"? 
                                     Esta ação não pode ser desfeita e todos os dados relacionados 
                                     (animais, atendimentos) serão perdidos.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                   <AlertDialogAction 
                                     onClick={() => handleDeleteClient(client.id)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                   >
                                     Excluir
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                           </div>
                         </div>

                        {/* Animais */}
                        {clientAnimals[client.id] && clientAnimals[client.id].length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Animais ({clientAnimals[client.id].length})
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {clientAnimals[client.id].map((animal) => (
                                <div key={animal.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h5 className="font-medium">{animal.name}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {animal.breed && animal.species ? `${animal.species} • ${animal.breed}` : (animal.breed || animal.species || '')}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                      {animal.age && <div>{animal.age} anos</div>}
                                      {animal.weight && <div>{animal.weight}kg</div>}
                                    </div>
                                  </div>
                                  {animal.observations && (
                                    <p className="text-sm text-muted-foreground">
                                      {animal.observations}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Histórico de Atendimentos */}
                        {clientAppointments[client.id] && clientAppointments[client.id].length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Histórico de Atendimentos ({clientAppointments[client.id].length})
                            </h4>
                            <div className="space-y-3">
                              {clientAppointments[client.id].map((appointment) => (
                                <div key={appointment.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-medium">{appointment.service_type}</h5>
                                        {getStatusBadge(appointment.status)}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                                        {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                        {appointment.animal_id && ` • Animal ID: ${appointment.animal_id}`}
                                      </p>
                                    </div>
                                    {appointment.price && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <DollarSign className="w-4 h-4" />
                                        R$ {appointment.price.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                  {appointment.description && (
                                    <p className="text-sm mb-2">{appointment.description}</p>
                                  )}
                                  {appointment.observations && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Observações:</strong> {appointment.observations}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2 text-muted-foreground">
                  Nenhum cliente cadastrado
                </p>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando seus primeiros clientes
                </p>
                <ClientRegistrationForm onClientAdded={fetchData} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Avaliações dos Clientes
              </CardTitle>
              <CardDescription>
                Feedback e comentários dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewClients.length > 0 ? (
                <div className="space-y-4">
                  {reviewClients.map((client) => (
                    <div key={`${client.id}-${client.created_at}`} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={client.avatar_url} />
                          <AvatarFallback>
                            {client.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{client.full_name}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(client.rating)}
                            </div>
                          </div>
                          
                          {client.comment && (
                            <p className="text-sm text-muted-foreground">
                              "{client.comment}"
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {new Date(client.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2 text-muted-foreground">
                    Nenhuma avaliação ainda
                  </p>
                  <p className="text-muted-foreground">
                    Quando clientes avaliarem seus produtos, elas aparecerão aqui
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={editingClient !== null} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome*</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Endereço do cliente"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Observações sobre o cliente"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1">
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingClient(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}