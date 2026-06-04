/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Contractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE"
}

export interface Invoice {
  id: string; // User-facing ID e.g., "INV-2024-001"
  uuid: string; // Unique internal uuid
  issuedDate: string;
  completedDate?: string;
  status: InvoiceStatus;
  contractor: Contractor;
  customer: Customer;
  items: ServiceItem[];
  workerSignature: string | null; // Base64 PNG signature
  customerSignature: string | null; // Base64 PNG signature
  terms: string;
  notes: string;
  taxRate: number; // percentage
}

export interface AppSettings {
  currency: string;
  defaultTaxRate: number;
  defaultTerms: string;
}
