/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Invoice, Contractor, Customer, InvoiceStatus } from "./types";

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: "cont-1",
    name: "Francisco Nicanor",
    company: "Precision HVAC Services",
    email: "contact@precisionhvac.com",
    phone: "503-555-0192",
    street: "482 Industrial Way",
    city: "Portland",
    state: "OR",
    zip: "97201"
  },
  {
    id: "cont-2",
    name: "Alex Rivera",
    company: "Rivera Technical Solutions",
    email: "alex@riveratech.io",
    phone: "503-555-0143",
    street: "731 Nancy St",
    city: "Barstow",
    state: "CA",
    zip: "92311"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Dustin Bynum",
    company: "Arden Properties LLC",
    email: "dbynum@ardenprop.com",
    phone: "503-555-8811",
    street: "901 Skyline Blvd",
    city: "Portland",
    state: "OR",
    zip: "97205"
  },
  {
    id: "cust-2",
    name: "Clara Jenkins",
    company: "Metro Retail Partners",
    email: "clara.j@metroparts.com",
    phone: "415-555-3390",
    street: "450 Broadway St",
    city: "San Francisco",
    state: "CA",
    zip: "94133"
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-2024-001",
    uuid: "invoice-1",
    issuedDate: "2024-10-24",
    status: InvoiceStatus.DRAFT,
    contractor: INITIAL_CONTRACTORS[0],
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        id: "item-1",
        description: "AC Unit Maintenance - Annual coil cleaning and filter replace",
        qty: 1,
        price: 185.00
      },
      {
        id: "item-2",
        description: "Refrigerant Top-up - R-410A coolant (per lb)",
        qty: 2,
        price: 60.00
      }
    ],
    workerSignature: null,
    customerSignature: null,
    terms: "Payment due upon completion of the job.",
    notes: "Maintenance carried out on the primary rooftop unit. Compressor operates within normal limits.",
    taxRate: 0
  },
  {
    id: "INV-2024-002",
    uuid: "invoice-2",
    issuedDate: "2024-10-30",
    status: InvoiceStatus.PAID,
    contractor: INITIAL_CONTRACTORS[0],
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        id: "item-3",
        description: "Emergency Leak Repair",
        qty: 1,
        price: 320.00
      },
      {
        id: "item-4",
        description: "Copper piping fittings & couplers",
        qty: 4,
        price: 15.00
      }
    ],
    workerSignature: null,
    customerSignature: null,
    terms: "Net 15 days.",
    notes: "Fast resolution of water line emergency in sector 3 storage room.",
    taxRate: 5
  },
  {
    id: "INV-2024-003",
    uuid: "invoice-3",
    issuedDate: "2024-11-12",
    status: InvoiceStatus.SENT,
    contractor: INITIAL_CONTRACTORS[1],
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        id: "item-5",
        description: "Ventilation fan replacement",
        qty: 1,
        price: 450.00
      }
    ],
    workerSignature: null,
    customerSignature: null,
    terms: "Payment due upon completion of the job.",
    notes: "Awaiting final confirmation and client signature on site.",
    taxRate: 8.5
  }
];
