-- Criar tabela de clientes cadastrados pelos fornecedores
CREATE TABLE public.supplier_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_supplier_clients_supplier FOREIGN KEY (supplier_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Criar tabela de animais dos clientes  
CREATE TABLE public.client_animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  species TEXT, -- cão, gato, etc
  breed TEXT, -- raça
  age INTEGER,
  weight DECIMAL(5,2),
  color TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_client_animals_client FOREIGN KEY (client_id) REFERENCES public.supplier_clients(id) ON DELETE CASCADE
);

-- Criar tabela de histórico de atendimentos
CREATE TABLE public.client_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  animal_id UUID,
  supplier_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  service_type TEXT NOT NULL, -- tipo de serviço prestado
  description TEXT,
  observations TEXT,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'concluido'::text, -- agendado, em_andamento, concluido, cancelado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_client_appointments_client FOREIGN KEY (client_id) REFERENCES public.supplier_clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_client_appointments_animal FOREIGN KEY (animal_id) REFERENCES public.client_animals(id) ON DELETE SET NULL,
  CONSTRAINT fk_client_appointments_supplier FOREIGN KEY (supplier_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS nas tabelas
ALTER TABLE public.supplier_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_appointments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para supplier_clients
CREATE POLICY "Suppliers can manage own clients"
ON public.supplier_clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = supplier_clients.supplier_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = 'fornecedor'
));

-- Criar políticas RLS para client_animals
CREATE POLICY "Suppliers can manage animals of their clients"
ON public.client_animals
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.supplier_clients sc
  JOIN public.profiles p ON p.id = sc.supplier_id
  WHERE sc.id = client_animals.client_id 
  AND p.user_id = auth.uid() 
  AND p.user_type = 'fornecedor'
));

-- Criar políticas RLS para client_appointments
CREATE POLICY "Suppliers can manage own appointments"
ON public.client_appointments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = client_appointments.supplier_id 
  AND profiles.user_id = auth.uid() 
  AND profiles.user_type = 'fornecedor'
));

-- Criar trigger para atualização automática de updated_at
CREATE TRIGGER update_supplier_clients_updated_at
BEFORE UPDATE ON public.supplier_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_animals_updated_at  
BEFORE UPDATE ON public.client_animals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_appointments_updated_at
BEFORE UPDATE ON public.client_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_supplier_clients_supplier_id ON public.supplier_clients(supplier_id);
CREATE INDEX idx_client_animals_client_id ON public.client_animals(client_id);
CREATE INDEX idx_client_appointments_client_id ON public.client_appointments(client_id);
CREATE INDEX idx_client_appointments_supplier_id ON public.client_appointments(supplier_id);
CREATE INDEX idx_client_appointments_animal_id ON public.client_appointments(animal_id);
CREATE INDEX idx_client_appointments_date ON public.client_appointments(appointment_date);