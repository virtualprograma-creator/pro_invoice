import { AppSettings } from "./types";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  currency: "$",
  defaultTaxRate: 5,
  defaultTerms: "Payment due upon completion of the job.",
  logo: null,
  hideTax: false,
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

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  return dateStr;
};
