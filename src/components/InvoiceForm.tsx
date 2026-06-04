/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Invoice, Contractor, Customer, ServiceItem, InvoiceStatus, AppSettings } from "../types";
import { formatCurrency } from "../utils";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

interface InvoiceFormProps {
  invoice: Invoice | null; // Null means creating new
  contractors: Contractor[];
  customers: Customer[];
  appSettings: AppSettings;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  contractors,
  customers,
  appSettings,
  onSave,
  onCancel,
}) => {
  // If invoice is null, set defaults for new invoice
  const [id, setId] = useState(invoice ? invoice.id : `INV-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`);
  const [uuid] = useState(invoice ? invoice.uuid : `invoice-${Date.now()}`);
  const [issuedDate, setIssuedDate] = useState(invoice ? invoice.issuedDate : new Date().toISOString().split("T")[0]);
  const [completedDate, setCompletedDate] = useState(invoice?.completedDate || "");
  const [status, setStatus] = useState<InvoiceStatus>(invoice ? invoice.status : InvoiceStatus.DRAFT);
  const [taxRate, setTaxRate] = useState<number>(invoice ? invoice.taxRate : appSettings.defaultTaxRate);
  const [terms, setTerms] = useState(invoice ? invoice.terms : appSettings.defaultTerms);
  const [notes, setNotes] = useState(invoice ? invoice.notes : "");
  const [hideTax, setHideTax] = useState<boolean>(
    invoice ? (invoice.hideTax ?? false) : (appSettings.hideTax ?? false)
  );

  // Selectable entities
  const [selectedContractorId, setSelectedContractorId] = useState<string>(
    invoice ? invoice.contractor.id : (contractors[0]?.id || "")
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    invoice ? invoice.customer.id : (customers[0]?.id || "")
  );

  // Fallbacks for custom data if selected "custom" or standard lists are empty
  const [items, setItems] = useState<ServiceItem[]>(
    invoice ? [...invoice.items] : [
      { id: "item-1", description: "General Consulting - Technical analysis and review", qty: 1, price: 100.00 }
    ]
  );

  // Line item input fields temporary state
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  const handleAddLineItem = () => {
    if (!newItemDesc.trim()) return alert("Favor ingresar la descripción del servicio");
    if (newItemQty <= 0) return alert("Cantidad tiene que ser mayor a 0");
    if (newItemPrice < 0) return alert("Precio tiene que ser positivo");

    const newItem: ServiceItem = {
      id: `item-${Date.now()}`,
      description: newItemDesc,
      qty: newItemQty,
      price: newItemPrice,
    };

    setItems([...items, newItem]);
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleDeleteLineItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedContractor = contractors.find((c) => c.id === selectedContractorId) || contractors[0];
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

    if (!selectedContractor) {
      alert("Por favor configure un Contractor antes de continuar.");
      return;
    }
    if (!selectedCustomer) {
      alert("Por favor configure un Customer antes de continuar.");
      return;
    }
    if (items.length === 0) {
      alert("Debe agregar al menos un servicio/producto en la factura.");
      return;
    }

    const savedInvoice: Invoice = {
      id,
      uuid,
      issuedDate,
      completedDate: completedDate || undefined,
      status,
      contractor: selectedContractor,
      customer: selectedCustomer,
      items,
      workerSignature: invoice ? invoice.workerSignature : null,
      customerSignature: invoice ? invoice.customerSignature : null,
      terms,
      notes,
      taxRate: Number(taxRate),
      hideWorkerSignature: invoice ? invoice.hideWorkerSignature : undefined,
      hideCustomerSignature: invoice ? invoice.hideCustomerSignature : undefined,
      hideTax: hideTax,
    };

    onSave(savedInvoice);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = hideTax ? 0 : subtotal * (taxRate / 100);
  const totalDue = subtotal + taxAmount;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Header and Go Back */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            {invoice ? `Edit Invoice #${invoice.id}` : "Create New Invoice Draft"}
          </h2>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters / Invoice Properties */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metadata Section Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
              1. Document Properties
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Invoice Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Invoice ID
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition font-mono"
                  placeholder="e.g. INV-2024-001"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              {/* Issued Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition font-mono"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                />
              </div>

              {/* Completed Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Date Completed
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition font-mono"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Invoice Status
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                >
                  <option value={InvoiceStatus.DRAFT}>Draft</option>
                  <option value={InvoiceStatus.SENT}>Sent</option>
                  <option value={InvoiceStatus.PAID}>Paid</option>
                  <option value={InvoiceStatus.OVERDUE}>Overdue</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Contractor Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Active Contractor
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition"
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                >
                  {contractors.map((cont) => (
                    <option key={cont.id} value={cont.id}>
                      {cont.company} ({cont.name})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Settings tab manages Contractors.</p>
              </div>

              {/* Customer Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Target Customer
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.company || cust.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Customers tab manages Clients.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  checked={hideTax}
                  onChange={(e) => setHideTax(e.target.checked)}
                />
                <span>Ocultar Impuestos (Tax) en esta factura</span>
              </label>
            </div>
          </div>

          {/* Line Items Builder Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              2. Line Items (Contract Services)
            </h3>

            {/* Render existing added line items */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-4 text-center">No services declared yet. Use input parameters below to append items.</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.qty} units x {formatCurrency(item.price, appSettings.currency)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-700 shrink-0">
                        {formatCurrency(item.qty * item.price, appSettings.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLineItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Insertion Box to Add a dynamic line item */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mt-2 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add New Service Entry</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-hidden focus:border-blue-500 placeholder-slate-400"
                  placeholder="Service description (e.g. Compressor Coil Clean replacement)"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-hidden font-mono"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      Unit Price ({appSettings.currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-hidden font-mono"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Append Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Term, Notes, and Pricing Preview Summary totals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Finance Breakdown Card */}
          <div className="bg-slate-900 border border-slate-950 text-white rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-3">
              Cost Summary
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Draft Subtotal</span>
                <span className="font-mono text-slate-200">{formatCurrency(subtotal, appSettings.currency)}</span>
              </div>

              {/* Tax Rate setting inline */}
              {!hideTax && (
                <div className="pt-2 flex items-center justify-between">
                  <label className="text-slate-400 flex items-center gap-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    className="w-16 border border-slate-700 bg-slate-800 text-white rounded-md p-1 pl-2 text-xs text-right font-mono"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                </div>
              )}

              {!hideTax && taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Computed Tax ({taxRate}%)</span>
                  <span className="font-mono text-slate-300">+{formatCurrency(taxAmount, appSettings.currency)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Estimated Due</span>
                <span className="text-xl font-bold font-mono text-blue-400">{formatCurrency(totalDue, appSettings.currency)}</span>
              </div>
            </div>
          </div>

          {/* Legal / Notes input fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 transition"
                placeholder="Payment terms metadata..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Administrative Notes
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 transition min-h-[100px]"
                placeholder="Declare any on-site conditions, model specifications or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
