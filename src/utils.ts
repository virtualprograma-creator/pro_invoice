import { AppSettings } from "./types";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  currency: "$",
  defaultTaxRate: 5,
  defaultTerms: "Payment due upon completion of the job.",
};

export const formatCurrency = (amount: number, currency: string) => {
  return `${currency}${amount.toFixed(2)}`;
};

export const safeLoadFromStorage = <T>(key: string, fallback: T): T => {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(savedValue) as T;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};
