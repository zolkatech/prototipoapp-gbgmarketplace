export const productCategories = [
  { value: 'servico', label: 'Serviços para Cavalos' },
  { value: 'ferradura', label: 'Ferradura' },
  { value: 'grosa', label: 'Grosa' },
  { value: 'acessorio', label: 'Acessório' },
  { value: 'ferramenta', label: 'Ferramenta' },
  { value: 'cravo', label: 'Cravo' },
  { value: 'sela', label: 'Sela' },
  { value: 'freio', label: 'Freio' },
  { value: 'estribo', label: 'Estribo' },
  { value: 'cuidados', label: 'Cuidados' },
  { value: 'outros', label: 'Outros' }
];

export const serviceCategories = [
  { value: 'ferrageamento', label: 'Ferrageamento' },
  { value: 'veterinario', label: 'Veterinário' },
  { value: 'dentista-equino', label: 'Dentista Equino' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'quiropratia', label: 'Quiropraxia' },
  { value: 'acupuntura', label: 'Acupuntura' },
  { value: 'exame-radiografico', label: 'Exame Radiográfico' },
  { value: 'ultrassom', label: 'Ultrassom' },
  { value: 'treinamento', label: 'Treinamento' },
  { value: 'doma', label: 'Doma' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'pensao', label: 'Pensão' },
  { value: 'tosquia', label: 'Tosquia' },
  { value: 'banho-tosa', label: 'Banho e Tosa' },
  { value: 'casco-podologia', label: 'Casqueamento/Podologia' },
  { value: 'nutricao', label: 'Nutrição Animal' },
  { value: 'reproducao', label: 'Reprodução' },
  { value: 'inseminacao', label: 'Inseminação Artificial' },
  { value: 'coleta-semen', label: 'Coleta de Sêmen' },
  { value: 'exame-gestacao', label: 'Exame de Gestação' },
  { value: 'parto-assistencia', label: 'Assistência ao Parto' }
];

export const getCategoryLabel = (categoryValue: string): string => {
  const productCategory = productCategories.find(cat => cat.value === categoryValue);
  if (productCategory) return productCategory.label;
  
  const serviceCategory = serviceCategories.find(cat => cat.value === categoryValue);
  if (serviceCategory) return serviceCategory.label;
  
  return categoryValue;
};

export const getAllCategories = () => [...productCategories, ...serviceCategories];