export const isNameEqualsPhone = (name: string, number: string): boolean => {
  return name.replace(/[+\-() ]/g, '') === number;
};

export const formatPhoneNumber = (phoneNumber: string): string | null => {

  if(!phoneNumber) return null;

  const cleaned = phoneNumber.replace(/\D/g, '');

  const countryCode = cleaned.slice(0, 2);
  const areaCode = cleaned.slice(2, 4);
  const firstPart = cleaned.slice(4, 9);
  const secondPart = cleaned.slice(9);

  return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
};
