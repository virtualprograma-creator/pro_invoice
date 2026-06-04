/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Invoice, InvoiceStatus, Customer, Contractor } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { FileText, Users, PlusCircle, DollarSign, Clock, CheckCircle } from "lucide-react";

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
    const tax = inv.hideTax ? 0 : subtotal * (inv.taxRate / 100);
    return sum + subtotal + tax;
  }, 0);

  const collected = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => {
      const subtotal = inv.items.reduce((s, item) => s + (item.qty * item.price), 0);
      const tax = inv.hideTax ? 0 : subtotal * (inv.taxRate / 100);
      return sum + subtotal + tax;
    }, 0);

  const pending = totalInvoiced - collected;

  const countByStatus = (status: InvoiceStatus) =>
    invoices.filter((inv) => inv.status === status).length;

  const totalInvoicesCount = invoices.length;
  const paidCount = countByStatus(InvoiceStatus.PAID);
  const sentCount = countByStatus(InvoiceStatus.SENT);
  const draftCount = countByStatus(InvoiceStatus.DRAFT);
  const overdueCount = countByStatus(InvoiceStatus.OVERDUE);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  const chartData = [
    { label: "Paid", count: paidCount, color: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-600" },
    { label: "Sent", count: sentCount, color: "#3b82f6", bgClass: "bg-blue-500", textClass: "text-blue-600" },
    { label: "Draft", count: draftCount, color: "#94a3b8", bgClass: "bg-slate-400", textClass: "text-slate-500" },
    { label: "Overdue", count: overdueCount, color: "#f43f5e", bgClass: "bg-rose-500", textClass: "text-rose-600" },
  ];

  const activeData = chartData.filter((d) => d.count > 0);
  const isEmpty = totalInvoicesCount === 0;

  let currentOffset = 0;
  const segments = activeData.map((d) => {
    const percentage = d.count / totalInvoicesCount;
    const strokeLength = percentage * circumference;
    const strokeOffset = circumference - strokeLength + currentOffset;
    currentOffset -= strokeLength;
    return {
      ...d,
      strokeLength,
      strokeOffset,
      percentage: Math.round(percentage * 100),
    };
  });

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

      {/* Primary Financial Stats */}
      {/* Desktop Version: Three Beautiful Cards side-by-side */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
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

      {/* Mobile Version: Single Line/Paragraph Layout */}
      <div className="block md:hidden bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Total: <span className="font-bold text-slate-900 font-mono">{formatCurrency(totalInvoiced, currency)}</span></span>
          </div>
          <span className="text-slate-300 hidden xs:inline">|</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Collected: <span className="font-bold text-emerald-600 font-mono">{formatCurrency(collected, currency)}</span></span>
          </div>
          <span className="text-slate-300 hidden xs:inline">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Pending: <span className="font-bold text-amber-600 font-mono">{formatCurrency(pending, currency)}</span></span>
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
        {/* Status Breakdown Visualiser (SVG Donut Chart) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Status Breakdown
          </h3>
          
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-around gap-6 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {isEmpty ? (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                ) : (
                  segments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeDasharray={`${seg.strokeLength} ${circumference - seg.strokeLength}`}
                      strokeDashoffset={seg.strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 hover:stroke-[12] cursor-pointer"
                      style={{ transformOrigin: "50px 50px" }}
                    />
                  ))
                )}
                {/* Central Labels */}
                <g className="transform rotate-90" style={{ transformOrigin: "50px 50px" }}>
                  <text
                    x="50"
                    y="46"
                    className="text-[14px] font-bold text-slate-900 font-sans"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {totalInvoicesCount}
                  </text>
                  <text
                    x="50"
                    y="58"
                    className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-sans"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {totalInvoicesCount === 1 ? "Invoice" : "Invoices"}
                  </text>
                </g>
              </svg>
            </div>

            {/* Custom Legend */}
            <div className="w-full space-y-2">
              {chartData.map((d, idx) => {
                const count = d.count;
                const percentage = totalInvoicesCount > 0 ? Math.round((count / totalInvoicesCount) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold hover:bg-slate-50 p-1.5 rounded-lg transition">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${d.bgClass}`} />
                      <span className="text-slate-700">{d.label}</span>
                    </div>
                    <div className="text-right text-slate-500 font-mono">
                      <span>{count}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
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
                const tax = inv.hideTax ? 0 : subtotal * (inv.taxRate / 100);
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
                      <span className="text-[10px] text-slate-400 block">{formatDate(inv.issuedDate)}</span>
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
