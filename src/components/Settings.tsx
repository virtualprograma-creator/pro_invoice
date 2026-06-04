/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Contractor, AppSettings } from "../types";
import { ShieldAlert, HardHat, Save, Trash2, Edit3, Plus, RotateCcw, Landmark } from "lucide-react";

interface SettingsProps {
  contractors: Contractor[];
  onAddContractor: (c: Contractor) => void;
  onUpdateContractor: (c: Contractor) => void;
  onDeleteContractor: (id: string) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetDatabase: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  contractors,
  onAddContractor,
  onUpdateContractor,
  onDeleteContractor,
  appSettings,
  onUpdateSettings,
  onResetDatabase,
}) => {
  const [currency, setCurrency] = useState(appSettings.currency);
  const [defaultTaxRate, setDefaultTaxRate] = useState(appSettings.defaultTaxRate);
  const [defaultTerms, setDefaultTerms] = useState(appSettings.defaultTerms);
  const [logo, setLogo] = useState<string | null>(appSettings.logo);
  const [hideTax, setHideTax] = useState(appSettings.hideTax ?? false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("El archivo es demasiado grande. El límite es de 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [isContractorFormOpen, setIsContractorFormOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);

  // Contractor Form Fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleOpenNewContractor = () => {
    setEditingContractor(null);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setZip("");
    setIsContractorFormOpen(true);
  };

  const handleOpenEditContractor = (cont: Contractor) => {
    setEditingContractor(cont);
    setName(cont.name);
    setCompany(cont.company);
    setEmail(cont.email);
    setPhone(cont.phone);
    setStreet(cont.street);
    setCity(cont.city);
    setState(cont.state);
    setZip(cont.zip);
    setIsContractorFormOpen(true);
  };

  const handleSaveContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Favor ingrese el nombre del contratista.");

    const freshCont: Contractor = {
      id: editingContractor ? editingContractor.id : `cont-${Date.now()}`,
      name,
      company,
      email,
      phone,
      street,
      city,
      state,
      zip,
    };

    if (editingContractor) {
      onUpdateContractor(freshCont);
    } else {
      onAddContractor(freshCont);
    }

    setIsContractorFormOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      currency,
      defaultTaxRate: Number(defaultTaxRate),
      defaultTerms,
      logo,
      hideTax,
    });
    alert("System specifications saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Cards block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: System defaults Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-slate-500" /> General Presets
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Active Currency
                </label>
                <select
                  title="Active Currency"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 focus:outline-hidden"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="$">US Dollar ($)</option>
                  <option value="EUR ">Euro (EUR)</option>
                  <option value="GBP ">Pound (GBP)</option>
                  <option value="MXN$">Peso Mexicano (MXN$)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  title="Default Tax Rate"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 focus:outline-hidden font-mono"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="hideTaxDefault"
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  checked={hideTax}
                  onChange={(e) => setHideTax(e.target.checked)}
                />
                <label htmlFor="hideTaxDefault" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Ocultar Tax por defecto
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Base Payment Terms
                </label>
                <input
                  title="Base Payment Terms"
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 focus:outline-hidden"
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Business Logo
                </label>
                <input
                  title="Business Logo File"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  onChange={handleLogoChange}
                />
                {logo && (
                  <div className="mt-2 relative inline-block group">
                    <img src={logo} alt="Logo Preview" className="h-12 object-contain border border-slate-200 rounded-lg p-1 bg-white" />
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 transition shadow-xs cursor-pointer"
                      title="Quitar Logo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Parameters
              </button>
            </form>
          </div>

          {/* Database Admin resets */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-rose-800 flex items-center gap-1.5 font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" /> Database Administration
            </h4>
            <p className="text-xs text-rose-700 leading-normal">
              Reset database files. Warning: this operation cancels and clears all local custom invoices, signatures and caches, restoring native mock HVAC samples.
            </p>
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de reiniciar la aplicación? Esto borrará tus firmas y facturas creadas.")) {
                  onResetDatabase();
                }
              }}
              type="button"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Local Database
            </button>
          </div>
        </div>

        {/* Right Side: Contractor profiles managers */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HardHat className="w-4 h-4 text-slate-500" /> Contractors & Technicians
            </h3>
            {!isContractorFormOpen && (
              <button
                onClick={handleOpenNewContractor}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Contractor
              </button>
            )}
          </div>

          {/* Contractor profile creation form slide */}
          {isContractorFormOpen && (
            <form onSubmit={handleSaveContractor} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {editingContractor ? "Edit Contractor details" : "Add Contractor profile"}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                  placeholder="Contractor/Technician Name (e.g. Alex Rivera)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                  placeholder="Company Brand (e.g. Rivera HVAC Solutions)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <input
                  type="email"
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                  placeholder="Phone Line"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs md:col-span-2"
                  placeholder="Street Address (e.g. 731 Nancy St)"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-mono"
                    placeholder="Zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/55">
                <button
                  type="button"
                  onClick={() => setIsContractorFormOpen(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Contractor
                </button>
              </div>
            </form>
          )}

          {/* List existing Contractor cards */}
          <div className="space-y-3">
            {contractors.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No contractor entities active. Create one above.</p>
            ) : (
              contractors.map((cont) => (
                <div
                  key={cont.id}
                  className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/40 hover:bg-slate-50 transition"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{cont.company || "Independent Worker"}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Technician: {cont.name}</p>
                    {cont.street && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Address: {cont.street}, {cont.city}, {cont.state} {cont.zip}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 sm:self-center self-end">
                    <button
                      onClick={() => handleOpenEditContractor(cont)}
                      className="p-1 px-2.5 text-[11px] font-semibold hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estas seguro de eliminar al contratista ${cont.company || cont.name}?`)) {
                          onDeleteContractor(cont.id);
                        }
                      }}
                      className="p-1 px-2.5 text-[11px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
