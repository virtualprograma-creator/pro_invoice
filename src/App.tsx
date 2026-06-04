/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent } from "react";
import {
  Invoice,
  Contractor,
  Customer,
  AppSettings,
  InvoiceStatus,
} from "./types";
import {
  INITIAL_CONTRACTORS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
} from "./data";
import { DEFAULT_APP_SETTINGS, safeLoadFromStorage } from "./utils";
import { Dashboard } from "./components/Dashboard";
import { InvoiceList } from "./components/InvoiceList";
import { InvoiceDetail } from "./components/InvoiceDetail";
import { InvoiceForm } from "./components/InvoiceForm";
import { CustomerManager } from "./components/CustomerManager";
import { Settings } from "./components/Settings";
import {
  Menu,
  User,
  LogOut,
  LockKeyhole,
  LayoutDashboard,
  Receipt,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";

export default function App() {
  const AUTH_STORAGE_KEY = "proinvoice_auth_v1";
  const AUTH_USER = "frank";
  const AUTH_PASSWORD = "1234";

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === AUTH_USER;
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation & Active Screen States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);

  // Core App Entities States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    if (loginUser.trim() === AUTH_USER && loginPassword === AUTH_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, AUTH_USER);
      setIsAuthenticated(true);
      setActiveTab("dashboard");
      setLoginError("");
      setLoginPassword("");
      return;
    }

    setLoginError("Invalid username or password.");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    setSelectedInvoice(null);
    setEditingInvoice(null);
    setIsCreatingInvoice(false);
    setActiveTab("dashboard");
  };

  // Loader Core State from LocalStorage
  useEffect(() => {
    setInvoices(safeLoadFromStorage("proinvoice_invoices_v1", INITIAL_INVOICES));
    setCustomers(safeLoadFromStorage("proinvoice_customers_v1", INITIAL_CUSTOMERS));
    setContractors(safeLoadFromStorage("proinvoice_contractors_v1", INITIAL_CONTRACTORS));
    setAppSettings(safeLoadFromStorage("proinvoice_settings_v1", DEFAULT_APP_SETTINGS));
  }, []);

  // Sync state functions that update both variables and local cache
  const saveAllInvoices = (updatedList: Invoice[]) => {
    setInvoices(updatedList);
    localStorage.setItem("proinvoice_invoices_v1", JSON.stringify(updatedList));
  };

  const saveAllCustomers = (updatedList: Customer[]) => {
    setCustomers(updatedList);
    localStorage.setItem("proinvoice_customers_v1", JSON.stringify(updatedList));
  };

  const saveAllContractors = (updatedList: Contractor[]) => {
    setContractors(updatedList);
    localStorage.setItem("proinvoice_contractors_v1", JSON.stringify(updatedList));
  };

  const saveSettings = (updatedSettings: AppSettings) => {
    setAppSettings(updatedSettings);
    localStorage.setItem("proinvoice_settings_v1", JSON.stringify(updatedSettings));
  };

  // ------------------------------
  // Invoice Operations Handles
  // ------------------------------
  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditingInvoice(null);
    setIsCreatingInvoice(false);
  };

  const handleUpdateInvoice = (updated: Invoice) => {
    const updatedList = invoices.map((inv) =>
      inv.uuid === updated.uuid ? updated : inv
    );
    saveAllInvoices(updatedList);
    if (selectedInvoice && selectedInvoice.uuid === updated.uuid) {
      setSelectedInvoice(updated);
    }
  };

  const handleSaveFormInvoice = (invoiceToSave: Invoice) => {
    const exists = invoices.some((inv) => inv.uuid === invoiceToSave.uuid);
    let updatedList: Invoice[] = [];
    if (exists) {
      updatedList = invoices.map((inv) =>
        inv.uuid === invoiceToSave.uuid ? invoiceToSave : inv
      );
    } else {
      updatedList = [invoiceToSave, ...invoices];
    }
    saveAllInvoices(updatedList);
    setSelectedInvoice(invoiceToSave); // Direct to detail signature pad view!
    setEditingInvoice(null);
    setIsCreatingInvoice(false);
  };

  const handleDeleteInvoice = (uuid: string) => {
    const updatedList = invoices.filter((inv) => inv.uuid !== uuid);
    saveAllInvoices(updatedList);
    if (selectedInvoice && selectedInvoice.uuid === uuid) {
      setSelectedInvoice(null);
    }
  };

  const handleAddNewInvoiceTrigger = () => {
    setActiveTab("invoices");
    setSelectedInvoice(null);
    setEditingInvoice(null);
    setIsCreatingInvoice(true);
  };

  // ------------------------------
  // Customer Operations Handles
  // ------------------------------
  const handleAddCustomer = (newCustomer: Customer) => {
    const updated = [newCustomer, ...customers];
    saveAllCustomers(updated);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    const updated = customers.map((c) =>
      c.id === updatedCustomer.id ? updatedCustomer : c
    );
    saveAllCustomers(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    saveAllCustomers(updated);
  };

  // ------------------------------
  // Contractor Operations Handles
  // ------------------------------
  const handleAddContractor = (newContractor: Contractor) => {
    const updated = [newContractor, ...contractors];
    saveAllContractors(updated);
  };

  const handleUpdateContractor = (updatedContractor: Contractor) => {
    const updated = contractors.map((c) =>
      c.id === updatedContractor.id ? updatedContractor : c
    );
    saveAllContractors(updated);
  };

  const handleDeleteContractor = (id: string) => {
    const updated = contractors.filter((c) => c.id !== id);
    saveAllContractors(updated);
  };

  // Reset database completely
  const handleResetDatabase = () => {
    localStorage.removeItem("proinvoice_invoices_v1");
    localStorage.removeItem("proinvoice_customers_v1");
    localStorage.removeItem("proinvoice_contractors_v1");
    localStorage.removeItem("proinvoice_settings_v1");

    setInvoices(INITIAL_INVOICES);
    setCustomers(INITIAL_CUSTOMERS);
    setContractors(INITIAL_CONTRACTORS);
    setAppSettings(DEFAULT_APP_SETTINGS);

    setSelectedInvoice(null);
    setEditingInvoice(null);
    setIsCreatingInvoice(false);
    setActiveTab("invoices");
    alert("Application dataset refreshed back to HVAC standard defaults.");
  };

  // Render core views based on screen switches
  const renderCurrentView = () => {
    if (activeTab === "dashboard") {
      return (
        <Dashboard
          invoices={invoices}
          customers={customers}
          contractors={contractors}
          currency={appSettings.currency}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedInvoice(null);
            setEditingInvoice(null);
            setIsCreatingInvoice(false);
          }}
          setSelectedInvoice={setSelectedInvoice}
          onCreateTempInvoice={handleAddNewInvoiceTrigger}
        />
      );
    }

    if (activeTab === "invoices") {
      // Invoices Detail View
      if (selectedInvoice) {
        return (
          <InvoiceDetail
            invoice={selectedInvoice}
            currency={appSettings.currency}
            onBack={() => setSelectedInvoice(null)}
            onUpdateInvoice={handleUpdateInvoice}
          />
        );
      }

      // Invoices Editing/Creating View Form
      if (isCreatingInvoice || editingInvoice) {
        return (
          <InvoiceForm
            invoice={editingInvoice}
            contractors={contractors}
            customers={customers}
            appSettings={appSettings}
            onSave={handleSaveFormInvoice}
            onCancel={() => {
              setIsCreatingInvoice(false);
              setEditingInvoice(null);
            }}
          />
        );
      }

      // Default Explorer List View
      return (
        <InvoiceList
          invoices={invoices}
          currency={appSettings.currency}
          onSelectInvoice={handleSelectInvoice}
          onEditInvoice={(inv) => {
            setEditingInvoice(inv);
            setSelectedInvoice(null);
            setIsCreatingInvoice(false);
          }}
          onDeleteInvoice={handleDeleteInvoice}
          onAddNewInvoice={handleAddNewInvoiceTrigger}
        />
      );
    }

    if (activeTab === "customers") {
      return (
        <CustomerManager
          customers={customers}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      );
    }

    if (activeTab === "settings") {
      return (
        <Settings
          contractors={contractors}
          onAddContractor={handleAddContractor}
          onUpdateContractor={handleUpdateContractor}
          onDeleteContractor={handleDeleteContractor}
          appSettings={appSettings}
          onUpdateSettings={saveSettings}
          onResetDatabase={handleResetDatabase}
        />
      );
    }

    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] text-slate-800 font-sans flex items-center justify-center px-4">
        <main className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                Pro Invoice V2
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Secure Access
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                value={loginUser}
                onChange={(e) => {
                  setLoginUser(e.target.value);
                  setLoginError("");
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError("");
                }}
              />
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm transition shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] text-slate-800 min-h-screen font-sans pb-28 relative">
      {/* Top Navigation Bar Header */}
      <header className="w-full sticky top-0 z-40 bg-white border-b border-slate-200 flex justify-between items-center px-4 h-14 no-print shadow-xs">
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-slate-100 rounded-lg text-blue-600 transition cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-sans font-bold text-lg tracking-tight text-slate-900">
            Pro Invoice V2
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-2 tracking-wider">Cloud Local</span>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition flex items-center justify-center border border-slate-200 cursor-pointer"
              title="User menu"
            >
              <User className="w-5 h-5" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-slate-900">frank</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-md md:max-w-xl lg:max-w-4xl mx-auto px-4 py-6">
        {renderCurrentView()}
      </main>

      {/* Bottom Floating Navigation Toolbar Shell (matches mockup custom blueprint pill format) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-md h-20 px-4 pb-safe flex justify-around items-center no-print">
        {/* Dashboard Pill button */}
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setSelectedInvoice(null);
            setEditingInvoice(null);
            setIsCreatingInvoice(false);
          }}
          className={`flex flex-col items-center justify-center w-20 py-1 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 font-sans">
            Dashboard
          </span>
        </button>

        {/* Invoices Pill button (rendered with similar blue highlight matching the mockup) */}
        <button
          onClick={() => {
            setActiveTab("invoices");
            setSelectedInvoice(null);
            setEditingInvoice(null);
            setIsCreatingInvoice(false);
          }}
          className={`flex flex-col items-center justify-center w-20 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "invoices"
              ? "bg-blue-600 text-white font-bold shadow-xs scale-105"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 font-sans">
            Invoices
          </span>
        </button>

        {/* Customers Pill button */}
        <button
          onClick={() => {
            setActiveTab("customers");
            setSelectedInvoice(null);
            setEditingInvoice(null);
            setIsCreatingInvoice(false);
          }}
          className={`flex flex-col items-center justify-center w-20 py-1 rounded-xl transition cursor-pointer ${
            activeTab === "customers"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 font-sans">
            Customers
          </span>
        </button>

        {/* Settings Pill button */}
        <button
          onClick={() => {
            setActiveTab("settings");
            setSelectedInvoice(null);
            setEditingInvoice(null);
            setIsCreatingInvoice(false);
          }}
          className={`flex flex-col items-center justify-center w-20 py-1 rounded-xl transition cursor-pointer ${
            activeTab === "settings"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 font-sans">
            Settings
          </span>
        </button>
      </nav>
    </div>
  );
}
