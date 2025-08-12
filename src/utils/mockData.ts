export type MockProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url?: string;
  images?: string[];
  category: string;
  created_at: string;
  supplier: {
    id: string;
    full_name?: string;
    business_name?: string;
    avatar_url?: string;
    city?: string;
    state?: string;
  };
  delivers: boolean;
  delivery_locations?: string[];
};

const categories = [
  'ferradura',
  'grosa',
  'acessorio',
  'ferramenta',
  'cravo',
  'sela',
  'freio',
  'estribo',
  'cuidados',
  'servico',
  'outros'
] as const;

const cities = [
  'Sorocaba - SP',
  'Pirassununga - SP',
  'Lages - SC',
  'Uberaba - MG',
  'Campo Grande - MS',
  'Jaguariúna - SP',
  'Pelotas - RS',
  'Barretos - SP',
  'Curvelo - MG',
  'Caxias do Sul - RS'
];

const supplierNames = [
  'Haras Estrela do Sul',
  'Rancho Boa Vista',
  'Ferragearia Cavalgar',
  'Saddle Pro Brasil',
  'Casa do Ferrador',
  'Selaria Ouro Negro',
  'Estância Santa Fé',
  'Equestre Premium',
  'Centro Farrier Pro',
  'Rural & Horse'
];

const productNames = [
  'Ferradura Premium em Aço',
  'Ferradura de Alumínio Leve',
  'Kit de Cravos Farrier',
  'Grosa Profissional para Casqueamento',
  'Sela Western Couro Legítimo',
  'Sela Australiana Confort',
  'Freio Inox Bocal Baixo',
  'Estribo Alumínio Anatômico',
  'Cinta Peitoral Reforçada',
  'Cabeçada em Couro Nobre',
  'Moletom de Tosa de Crina',
  'Shampoo Antisséptico Equino',
  'Pomada Cicatrizante para Cascos',
  'Escova de Cerdas Naturais',
  'Balde de Ração 20L',
  'Bebedouro Automático Inox',
  'Selim Infantil',
  'Proteção de Boulet Neoprene',
  'Luva de Ferrador Anticorte',
  'Manta Gel Antichoque',
  'Serviço de Casqueamento Profissional',
  'Serviço de Ferrageamento Completo',
  'Serviço de Ajuste de Sela',
  'Serviço de Doma Racional (pacote)',
  'Serviço de Tosa e Higienização',
  'Suplemento Mineral Equino 5kg',
  'Ração Premium 25kg',
  'Corda de Laço Profissional',
  'Freio Pelham Cobre',
  'Focinheira de Treino',
  'Bota de Descanso',
  'Coletor de Fezes Portátil',
  'Capacete Equestre Certificado',
  'Kit Limpeza do Estábulo',
  'Pelego Natural',
  'Protetor de Cauda',
  'Arreio Completo Rodeio',
  'Serrote de Ferrador',
  'Alicate Arrancador de Cravo',
  'Raspadeira de Borracha',
  'Ferradura Terapêutica',
  'Mochila de Sela Multiuso',
  'Sela Militar',
  'Sela de Tambor',
  'Cabresto de Nylon',
  'Banda de Casco Adesiva',
  'Gel Hidratante de Casco',
  'Serviço de Transporte Local',
  'Serviço Emergencial de Casco',
  'Serviço de Avaliação Postural'
];

const sources = [
  'horse',
  'equestrian',
  'saddle',
  'farrier',
  'horseshoe',
  'stable',
  'ranch',
  'hoof',
  'grooming',
  'cowboy',
];

function randomFrom<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateEquineMockProducts(count = 50): MockProduct[] {
  const items: MockProduct[] = [];
  for (let i = 0; i < count; i++) {
    const cat = randomFrom(categories);
    const baseName = randomFrom(productNames);
    const supplierIndex = Math.floor(Math.random() * supplierNames.length);
    const supplierName = supplierNames[supplierIndex];
    const city = randomFrom(cities);
    const price = cat === 'servico' ? randomPrice(80, 600) : randomPrice(49, 2990);
    const hasDiscount = Math.random() < 0.5;
    const discount = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0;
    const orig = hasDiscount ? Math.round((price / (1 - discount / 100)) * 100) / 100 : undefined;
    const seed = `equine-${i}-${Date.now()}`;
    const topic = randomFrom(sources);
    const image = `https://source.unsplash.com/seed/${seed}/800x800?${topic}`;

    items.push({
      id: `mock-${i}`,
      name: baseName,
      description: `${baseName} para uso equino. Mock ${i + 1}.`,
      price,
      original_price: orig,
      discount_percentage: hasDiscount ? discount : undefined,
      image_url: image,
      images: [image, `https://source.unsplash.com/seed/${seed}-b/800x800?${topic}`],
      category: cat,
      created_at: new Date(Date.now() - i * 36e5).toISOString(),
      supplier: {
        id: `mock-supplier-${supplierIndex}`,
        business_name: supplierName,
        full_name: undefined,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(supplierName)}`,
        city,
        state: undefined,
      },
      delivers: Math.random() < 0.8,
      delivery_locations: [city.split(' - ')[0], randomFrom(cities).split(' - ')[0]],
    });
  }
  return items;
}
