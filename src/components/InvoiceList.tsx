/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Invoice, InvoiceStatus } from "../types";
import { formatCurrency } from "../utils";
import { PlusCircle, Search, Edit3, Trash2, Eye, Filter } from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  currency: string;
  onSelectInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (uuid: string) => void;
  onAddNewInvoice: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  currency,
  onSelectInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onAddNewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter invoices based on status & search terms
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contractor.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 justify-between">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 transition font-sans"
            placeholder="Search by invoice ID, client or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2 py-1.5 rounded-lg focus:outline-hidden focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value={InvoiceStatus.DRAFT}>Draft</option>
            <option value={InvoiceStatus.SENT}>Sent</option>
            <option value={InvoiceStatus.PAID}>Paid</option>
            <option value={InvoiceStatus.OVERDUE}>Overdue</option>
          </select>

          <button
            onClick={onAddNewInvoice}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Invoice
          </button>
        </div>
      </div>

      {/* Invoice Grid / Rows */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 px-4 space-y-2">
            <p className="font-semibold text-base text-slate-800">No invoices match your selection</p>
            <p className="text-xs text-slate-400">Try loosening your search terms or create a new invoice draft instead.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => {
              const subtotal = inv.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
              const tax = subtotal * (inv.taxRate / 100);
              const total = subtotal + tax;

              return (
                <div
                  key={inv.uuid}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition cursor-pointer"
                  onClick={() => onSelectInvoice(inv)}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 font-sans tracking-tight">#{inv.id}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          inv.status === InvoiceStatus.PAID
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === InvoiceStatus.SENT
                            ? "bg-blue-100 text-blue-800"
                            : inv.status === InvoiceStatus.OVERDUE
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Client</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {inv.customer.company || inv.customer.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Contractor</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {inv.contractor.company || inv.contractor.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                    <div>
                      <span className="text-lg font-bold font-mono text-slate-950 block sm:text-right">
                        {formatCurrency(total, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block sm:text-right">
                        Issued: {inv.issuedDate}
                      </span>
                    </div>

                    {/* Action buttons (stop propagation to prevent select navigation) */}
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInvoice(inv);
                        }}
                        className="p-1 px-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Ver y Firmar"
                      >
                        <Eye className="w-3.5 h-3.5" /> Sign Pad
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditInvoice(inv);
                        }}
                        className="p-1.5 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Editar Factura"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Estas seguro de eliminar la factura #${inv.id}?`)) {
                            onDeleteInvoice(inv.uuid);
                          }
                        }}
                        className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
