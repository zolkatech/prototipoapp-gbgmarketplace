import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  client_id: string;
  supplier_id: string;
  animal_id: string | null;
  appointment_date: string; // ISO
  service_type: string;
  status: string | null;
  description: string | null;
  observations: string | null;
  price: number | null;
  location: string | null;
}

interface ClientMap {
  [id: string]: { name: string | null; email: string | null };
}

const statusColor: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300",
  concluido: "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300",
};

export default function SupplierAgenda() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<ClientMap>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "todos">("todos");

  // New appointment dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientsList, setClientsList] = useState<{ id: string; name: string | null }[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    appointment_date: "",
    service_type: "",
    price: "",
    location: "",
    description: "",
  });

  const fetchData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data: appts, error } = await supabase
        .from("client_appointments")
        .select("*")
        .eq("supplier_id", profile.id)
        .order("appointment_date", { ascending: true });

      if (error) throw error;

      setAppointments(appts || []);

      const clientIds = Array.from(new Set((appts || []).map((a) => a.client_id)));
      if (clientIds.length) {
        const { data: cts, error: clientErr } = await supabase
          .from("supplier_clients")
          .select("id, name, email")
          .in("id", clientIds);
        if (clientErr) throw clientErr;
        const map: ClientMap = {};
        (cts || []).forEach((c) => (map[c.id] = { name: c.name, email: c.email }));
        setClients(map);
      } else {
        setClients({});
      }

      // Buscar todos os clientes do fornecedor para o formulário de novo agendamento
      const { data: allClients, error: allClientsErr } = await supabase
        .from("supplier_clients")
        .select("id, name")
        .eq("supplier_id", profile.id)
        .order("name", { ascending: true });
      if (allClientsErr) throw allClientsErr;
      setClientsList(allClients || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao carregar agenda",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const byStatus = statusFilter === "todos" || (a.status || "").toLowerCase() === statusFilter;
      if (!byStatus) return false;
      if (!q) return true;
      const clientName = clients[a.client_id]?.name?.toLowerCase() || "";
      const fields = [a.service_type, a.location || "", a.description || "", clientName].map((s) => s.toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [appointments, clients, search, statusFilter]);

  const updateStatus = async (id: string, next: string) => {
    const prev = appointments.find((a) => a.id === id)?.status || null;
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: next } : a)));
    const { error } = await supabase.from("client_appointments").update({ status: next }).eq("id", id);
    if (error) {
      // revert
      setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: prev } : a)));
      toast({ title: "Não foi possível atualizar", variant: "destructive" });
    } else {
      toast({ title: "Status atualizado" });
    }
};

  const handleDelete = async (id: string) => {
    const prevList = appointments;
    setAppointments((list) => list.filter((a) => a.id !== id));
    const { error } = await supabase.from("client_appointments").delete().eq("id", id);
    if (error) {
      setAppointments(prevList);
      toast({ title: "Não foi possível excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento excluído" });
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!form.client_id || !form.appointment_date || !form.service_type) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    setCreating(true);
    const payload = {
      supplier_id: profile.id,
      client_id: form.client_id,
      appointment_date: new Date(form.appointment_date).toISOString(),
      service_type: form.service_type,
      status: "agendado",
      description: form.description || null,
      location: form.location || null,
      price: form.price ? Number(form.price) : null,
    } as const;

    const { error } = await supabase.from("client_appointments").insert(payload);
    if (error) {
      toast({ title: "Não foi possível criar o agendamento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento criado" });
      setCreateOpen(false);
      setForm({ client_id: "", appointment_date: "", service_type: "", price: "", location: "", description: "" });
      fetchData();
    }
    setCreating(false);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex flex-col gap-4 md:gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-2xl lg:text-3xl font-semibold">Agenda de Serviços</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Gerencie seus agendamentos por data, status e cliente.</p>
        </div>
        <div className="flex flex-col sm:flex-row md:grid md:grid-cols-2 lg:flex lg:flex-row gap-2 w-full lg:w-auto">
          <Input
            placeholder="Buscar por cliente, serviço ou local"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 md:col-span-2 lg:col-span-1"
          />
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 whitespace-nowrap">
              <RefreshCw className="w-4 h-4" /> 
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>

          {/* Botão e diálogo para novo agendamento (simples e intuitivo) */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              + Novo agendamento
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo agendamento</DialogTitle>
                <DialogDescription>Preencha as informações do serviço.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Cliente</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm((f) => ({ ...f, client_id: v }))}>
                    <SelectTrigger id="client_id">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || "Sem nome"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Data e hora</Label>
                  <Input
                    id="appointment_date"
                    type="datetime-local"
                    value={form.appointment_date}
                    onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_type">Serviço</Label>
                  <Input
                    id="service_type"
                    value={form.service_type}
                    onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
                    placeholder="Ex.: Banho e tosa"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Valor (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Observações</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 lg:gap-6">
        {filtered.map((a) => (
          <Card key={a.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2 pb-3">
              <CardTitle className="text-base lg:text-lg font-medium flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDate(a.appointment_date)}</span>
                <span className="text-muted-foreground hidden sm:inline">às</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 flex-shrink-0" /> 
                  <span className="whitespace-nowrap">{formatTime(a.appointment_date)}</span>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${statusColor[(a.status || "agendado").toLowerCase()] || ""} whitespace-nowrap`}>
                  {(a.status || "agendado").replace("_", " ")}
                </Badge>
                <Select value={(a.status || "agendado").toLowerCase()} onValueChange={(v) => updateStatus(a.id, v)}>
                  <SelectTrigger className="w-32 md:w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Excluir agendamento" className="flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Deseja remover este agendamento?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(a.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="text-sm lg:text-base space-y-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{a.location || "Não informado"}</span>
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <span className="font-medium">{clients[a.client_id]?.name || "-"}</span>
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground">Serviço:</span>{" "}
                  <span className="font-medium">{a.service_type}</span>
                </div>
                {typeof a.price === "number" && (
                  <div className="whitespace-nowrap">
                    <span className="text-muted-foreground">Valor:</span>{" "}
                    <span className="font-medium">R$ {a.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
              {a.description && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-muted-foreground leading-relaxed">{a.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <Card>
            <CardContent className="py-12 lg:py-16 text-center text-muted-foreground">
              <div className="text-lg lg:text-xl mb-2">
                {loading ? "Carregando..." : "Nenhum agendamento encontrado."}
              </div>
              {!loading && (
                <p className="text-sm">Tente ajustar os filtros ou criar um novo agendamento.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
