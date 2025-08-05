export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const parseISODate = (isoString: string): Date => {
  return new Date(isoString);
};

export const isValidDate = (date: any): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}; 