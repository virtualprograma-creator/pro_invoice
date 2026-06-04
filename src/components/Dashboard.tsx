/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Invoice, InvoiceStatus, Customer, Contractor } from "../types";
import { formatCurrency } from "../utils";
import { FileText, Users, DollarSign, Clock, CheckCircle, PlusCircle } from "lucide-react";

interface DashboardProps {
  invoices: Invoice[];
  customers: Customer[];
  contractors: Contractor[];
  currency: string;
  setActiveTab: (tab: string) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  onCreateTempInvoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  customers,
  contractors,
  currency,
  setActiveTab,
  setSelectedInvoice,
  onCreateTempInvoice,
}) => {
  // Calculations
  const totalInvoiced = invoices.reduce((sum, inv) => {
    const subtotal = inv.items.reduce((s, item) => s + (item.qty * item.price), 0);
    const tax = subtotal * (inv.taxRate / 100);
    return sum + subtotal + tax;
  }, 0);

  const collected = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => {
      const subtotal = inv.items.reduce((s, item) => s + (item.qty * item.price), 0);
      const tax = subtotal * (inv.taxRate / 100);
      return sum + subtotal + tax;
    }, 0);

  const pending = totalInvoiced - collected;

  const countByStatus = (status: InvoiceStatus) =>
    invoices.filter((inv) => inv.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 overflow-hidden relative">
        <div className="relative z-10">
          <span className="text-xs font-semibold bg-blue-600/30 text-blue-300 inline-block px-3 py-1 rounded-full mb-2 uppercase tracking-wider backdrop-blur-xs">
            Performance Overview
          </span>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Invoice Dashboard</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-md">
            Manage your local operations, draft invoices, capture client signatures on site, and generate pristine PDF invoices instantly.
          </p>
        </div>
        {/* Background Accent Lines */}
        <div className="absolute top-0 right-0 h-full w-1/3 border-l border-slate-700/20 transform skew-x-12 bg-slate-800/10" />
      </div>

      {/* Primary Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total Invoiced</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvoiced, currency)}</span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Collected</span>
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(collected, currency)}</span>
          </div>
        </div>

        {/* Balance Pending */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block font-sans">Pending Balance</span>
            <span className="text-2xl font-bold text-amber-600">{formatCurrency(pending, currency)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onCreateTempInvoice}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 hover:text-blue-600 transition group text-center"
          >
            <PlusCircle className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium font-sans">New Invoice</span>
          </button>
          
          <button
            onClick={() => setActiveTab("customers")}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 hover:text-blue-600 transition group text-center"
          >
            <Users className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium font-sans">Add Customer</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 hover:text-blue-600 transition group text-center"
          >
            <FileText className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium font-sans">Contractors</span>
          </button>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-950 rounded-xl text-slate-50 text-center">
            <span className="text-2xl font-bold font-mono">{invoices.length}</span>
            <span className="text-xs font-medium font-sans mt-2">Active Invoices</span>
          </div>
        </div>
      </div>

      {/* Invoice Status Distribution and Recent Activities split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Visualiser */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Status Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-600 flex items-center gap-1">🟢 Paid</span>
                <span className="text-slate-700">{countByStatus(InvoiceStatus.PAID)} ({((countByStatus(InvoiceStatus.PAID)/invoices.length)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(countByStatus(InvoiceStatus.PAID)/invoices.length)*100 || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-blue-600 flex items-center gap-1">🔵 Sent</span>
                <span className="text-slate-700">{countByStatus(InvoiceStatus.SENT)} ({((countByStatus(InvoiceStatus.SENT)/invoices.length)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(countByStatus(InvoiceStatus.SENT)/invoices.length)*100 || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-500 flex items-center gap-1">⚫ Draft</span>
                <span className="text-slate-700">{countByStatus(InvoiceStatus.DRAFT)} ({((countByStatus(InvoiceStatus.DRAFT)/invoices.length)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${(countByStatus(InvoiceStatus.DRAFT)/invoices.length)*100 || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-rose-600 flex items-center gap-1">🔴 Overdue</span>
                <span className="text-slate-700">{countByStatus(InvoiceStatus.OVERDUE)} ({((countByStatus(InvoiceStatus.OVERDUE)/invoices.length)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(countByStatus(InvoiceStatus.OVERDUE)/invoices.length)*100 || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Recent Invoices
            </h3>
            <button
              onClick={() => setActiveTab("invoices")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No invoices found. Click "New Invoice" to create one.
              </div>
            ) : (
              invoices.map((inv) => {
                const subtotal = inv.items.reduce((s, item) => s + (item.qty * item.price), 0);
                const tax = subtotal * (inv.taxRate / 100);
                const total = subtotal + tax;

                return (
                  <div
                    key={inv.uuid}
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setActiveTab("invoices");
                    }}
                    className="py-3 flex justify-between items-center hover:bg-slate-50 cursor-pointer rounded-lg px-2 -mx-2 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{inv.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
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
                      <p className="text-xs text-slate-500 truncate mt-1">
                        Client: {inv.customer.company || inv.customer.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block font-mono">{formatCurrency(total, currency)}</span>
                      <span className="text-[10px] text-slate-400 block">{inv.issuedDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
