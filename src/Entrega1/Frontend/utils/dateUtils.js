import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDateDaysAgo = (days) => {
  return format(subDays(new Date(), days), 'yyyy-MM-dd');
};

export const formatDate = (dateString, formatStr = 'PP') => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString;
  }
};

export const formatCurrency = (value) => {
  const number = Number(value);
  if (isNaN(number)) {
    return 'R$ 0,00';
  }
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatNumber = (value) => {
  const number = Number(value);
  if (isNaN(number)) {
    return '0';
  }
  return number.toLocaleString('pt-BR');
};