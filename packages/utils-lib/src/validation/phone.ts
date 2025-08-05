export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
}; 