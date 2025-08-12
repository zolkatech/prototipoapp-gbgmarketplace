/**
 * Utilitários para formatação e validação de números do WhatsApp
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Formata um número de telefone brasileiro para WhatsApp
 * Aceita diversos formatos e normaliza para o formato correto
 * APENAS quando o usuário termina de digitar (onBlur)
 */
export const formatWhatsAppNumber = (input: string): string => {
  // Se está vazio, retorna vazio
  if (!input || input.trim() === '') {
    return '';
  }
  
  // Remove todos os caracteres não numéricos
  let digits = cleanPhoneNumber(input);
  
  // Se começar com +55, remove
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.substring(2);
  }
  
  // Se tem menos de 10 dígitos, retorna como está para o usuário continuar digitando
  if (digits.length < 10) {
    return digits;
  }
  
  // Se tem 10 dígitos, adiciona o 9 no celular (formato antigo)
  if (digits.length === 10) {
    const ddd = digits.substring(0, 2);
    const numero = digits.substring(2);
    
    // Verifica se é um número de celular (começa com 6, 7, 8 ou 9)
    if (['6', '7', '8', '9'].includes(numero[0])) {
      digits = ddd + '9' + numero;
    }
  }
  
  // Se tem 11 dígitos, está correto
  if (digits.length === 11) {
    return digits;
  }
  
  // Se tem mais de 11 dígitos, pega apenas os primeiros 11
  return digits.substring(0, 11);
};

/**
 * Valida se um número de WhatsApp brasileiro está correto
 */
export const validateBrazilianWhatsApp = (number: string): boolean => {
  const cleaned = cleanPhoneNumber(number);
  
  // Deve ter exatamente 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }
  
  // Primeiros 2 dígitos devem ser um DDD válido (11-99)
  const ddd = parseInt(cleaned.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Terceiro dígito deve ser 9 (celular)
  if (cleaned[2] !== '9') {
    return false;
  }
  
  // Quarto dígito deve ser 6, 7, 8 ou 9
  if (!['6', '7', '8', '9'].includes(cleaned[3])) {
    return false;
  }
  
  return true;
};

/**
 * Formata o número para exibição com máscara
 */
export const formatPhoneDisplay = (number: string): string => {
  const cleaned = cleanPhoneNumber(number);
  
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  if (cleaned.length <= 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  
  return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
};

/**
 * Gera o número completo para uso no WhatsApp (+55...)
 */
export const getWhatsAppFullNumber = (number: string): string => {
  const cleaned = cleanPhoneNumber(number);
  const formatted = formatWhatsAppNumber(cleaned);
  
  if (validateBrazilianWhatsApp(formatted)) {
    return `+55${formatted}`;
  }
  
  return '';
};

/**
 * Gera a URL do WhatsApp com mensagem
 */
export const generateWhatsAppURL = (number: string, message: string = ''): string => {
  const fullNumber = getWhatsAppFullNumber(number);
  
  if (!fullNumber) {
    return '';
  }
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullNumber.replace('+', '')}${message ? `?text=${encodedMessage}` : ''}`;
};