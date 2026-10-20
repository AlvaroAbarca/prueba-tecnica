export const postalCodePatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
  UK: /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR 0AA)$/,
  CL: /^\d{7}$/,
  AR: /^\d{5}$/,
} as const;
