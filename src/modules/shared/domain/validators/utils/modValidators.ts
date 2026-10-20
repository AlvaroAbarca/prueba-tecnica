export const isCheckDigitValid = (rut: string): boolean => {
  const [numberPart, checkDigit] = rut.split('-');
  const digits = numberPart.split('').map(Number).reverse();
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i + 2);
  }

  const calculatedCheckDigit = (11 - (sum % 11)) % 11;
  const expectedCheckDigit = checkDigit.toUpperCase() === 'K' ? 10 : Number.parseInt(checkDigit, 10);

  return calculatedCheckDigit === expectedCheckDigit;
};
