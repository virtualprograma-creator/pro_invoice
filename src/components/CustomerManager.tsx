/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Customer } from "../types";
import { Users, UserPlus, Trash2, Edit3, Search, Mail, Phone, MapPin, X, Save } from "lucide-react";

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleOpenNewForm = () => {
    setEditingCustomer(null);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setZip("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setCompany(cust.company);
    setEmail(cust.email);
    setPhone(cust.phone);
    setStreet(cust.street);
    setCity(cust.city);
    setState(cust.state);
    setZip(cust.zip);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Por favor inserte el nombre del cliente.");

    const freshCust: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name,
      company,
      email,
      phone,
      street,
      city,
      state,
      zip,
    };

    if (editingCustomer) {
      onUpdateCustomer(freshCust);
    } else {
      onAddCustomer(freshCust);
    }

    setIsFormOpen(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper stats banner */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Customers Dashboard</h2>
            <p className="text-xs text-slate-400">Total: {customers.length} business entities managed locally.</p>
          </div>
        </div>
        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2 px-4 rounded-lg transition shadow-xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add Customer
        </button>
      </div>

      {/* Interactive Creation/Editing modal or slideover card */}
      {isFormOpen && (
        <div className="bg-white border-2 border-blue-500/30 rounded-xl p-5 shadow-md relative animate-fade-in">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            {editingCustomer ? `Edit Customer details: ${editingCustomer.name}` : "Create New Customer Entity"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Contact Person Name</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                placeholder="e.g. Dustin Bynum"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Company Brand Name</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                placeholder="e.g. Arden Properties LLC"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Email Address</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                placeholder="e.g. billing@ardenprop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Phone Number</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                placeholder="e.g. 503-555-8811"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Street Address */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Street Address</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                placeholder="e.g. 901 Skyline Blvd"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">City</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                  placeholder="e.g. Portland"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">State</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                  placeholder="e.g. OR"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Zip</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                  placeholder="e.g. 97205"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Filter / Search and List display */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-hidden"
            placeholder="Search customers by company or contact name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Client Grid display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
              No customers match your exploration filters.
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition gap-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.company || "Individual Client"}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{c.name}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-4 text-xs text-slate-600">
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {(c.street || c.city) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">
                          {c.street}, {c.city}, {c.state} {c.zip}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditForm(c)}
                    className="p-1 px-2.5 text-xs font-semibold hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Estas seguro de eliminar al cliente ${c.company || c.name}?`)) {
                        onDeleteCustomer(c.id);
                      }
                    }}
                    className="p-1 px-2 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
