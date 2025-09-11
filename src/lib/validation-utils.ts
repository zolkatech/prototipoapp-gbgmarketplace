// Validation utilities for secure input handling
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // All same digits
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false; // All same digits
  
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  if (remainder !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  if (remainder !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
}

export function validateCPFOrCNPJ(document: string): { isValid: boolean; type: 'CPF' | 'CNPJ' | null } {
  const clean = document.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return { isValid: validateCPF(clean), type: 'CPF' };
  } else if (clean.length === 14) {
    return { isValid: validateCNPJ(clean), type: 'CNPJ' };
  }
  
  return { isValid: false, type: null };
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
}

export function formatCPFOrCNPJ(document: string): string {
  const clean = document.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return formatCPF(clean);
  } else if (clean.length === 14) {
    return formatCNPJ(clean);
  }
  
  return document;
}

export function maskCPFOrCNPJ(document: string): string {
  const clean = document.replace(/\D/g, '');
  
  if (clean.length === 11) {
    // CPF: Show only first 3 and last 2 digits
    return clean.replace(/(\d{3})(\d{5})(\d{2})/, '$1.***.***-$3');
  } else if (clean.length === 14) {
    // CNPJ: Show only first 2 and last 4 digits
    return clean.replace(/(\d{2})(\d{8})(\d{4})/, '$1.***.***/$3');
  }
  
  return document;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  // Brazilian phone: 10 or 11 digits (with area code)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  if (clean.length === 8) {
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Adicione pelo menos uma letra minúscula');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Adicione pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Adicione pelo menos um número');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Adicione pelo menos um caractere especial');
  } else {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  };
}