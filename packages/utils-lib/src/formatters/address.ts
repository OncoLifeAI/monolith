export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const parseAddress = (addressString: string): {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
} => {
  const parts = addressString.split(',').map(part => part.trim());
  return {
    street: parts[0],
    city: parts[1],
    state: parts[2],
    zipCode: parts[3],
    country: parts[4]
  };
}; 