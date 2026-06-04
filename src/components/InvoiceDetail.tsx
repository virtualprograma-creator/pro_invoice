/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { Invoice, InvoiceStatus } from "../types";
import { formatCurrency } from "../utils";
import { Send, Trash2, ArrowLeft, Check, Printer } from "lucide-react";
import { jsPDF } from "jspdf";

interface InvoiceDetailProps {
  invoice: Invoice;
  currency: string;
  onBack: () => void;
  onUpdateInvoice: (updated: Invoice) => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  invoice,
  currency,
  onBack,
  onUpdateInvoice,
}) => {
  const workerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const customerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const invoiceRef = useRef<HTMLElement | null>(null);

  const isSignatureCaptured = (signature: string | null) =>
    !!signature && signature !== "mock-signature-exists";

  const [workerSigned, setWorkerSigned] = useState(isSignatureCaptured(invoice.workerSignature));
  const [customerSigned, setCustomerSigned] = useState(isSignatureCaptured(invoice.customerSignature));
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Initialize and load saved signatures or clear canvases on load
  useEffect(() => {
    const cleanupWorkerCanvas = initCanvas(workerCanvasRef.current, invoice.workerSignature, (sig) => {
      onUpdateInvoice({ ...invoice, workerSignature: sig });
      setWorkerSigned(isSignatureCaptured(sig));
    });
    const cleanupCustomerCanvas = initCanvas(customerCanvasRef.current, invoice.customerSignature, (sig) => {
      onUpdateInvoice({ ...invoice, customerSignature: sig });
      setCustomerSigned(isSignatureCaptured(sig));
    });

    return () => {
      cleanupWorkerCanvas?.();
      cleanupCustomerCanvas?.();
    };
  }, [invoice.uuid]);

  const initCanvas = (
    canvas: HTMLCanvasElement | null,
    savedSignature: string | null,
    onSave: (sig: string | null) => void
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset dimensions to match client layout
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 340;
    canvas.height = rect.height || 160;

    // Clean drawing configurations
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Load existing signature image if exists
    if (savedSignature && savedSignature !== "mock-signature-exists") {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = savedSignature;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let drawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e) {
        if (e.touches.length === 0) return { x: 0, y: 0 };
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      if (e.cancelable) e.preventDefault();
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (e.cancelable) e.preventDefault();
    };

    const end = () => {
      if (!drawing) return;
      drawing = false;
      // Convert to image and call onSave callback
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    };

    // Attach event listeners
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    // Return cleanup (not strictly executed immediately but good practice)
    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  };

  const clearCanvas = (canvas: HTMLCanvasElement | null, type: "worker" | "customer") => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (type === "worker") {
      onUpdateInvoice({ ...invoice, workerSignature: null });
      setWorkerSigned(false);
    } else {
      onUpdateInvoice({ ...invoice, customerSignature: null });
      setCustomerSigned(false);
    }
  };

  const computeTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = computeTotals();

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return false;
    setIsGeneratingPdf(true);
    setPdfError(null);
    
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const rightEdge = pageWidth - margin;
      let y = 18;

      const ensureSpace = (needed: number) => {
        if (y + needed <= pageHeight - margin) return;
        pdf.addPage();
        y = margin;
      };

      const drawLabelValue = (label: string, value: string, x: number, currentY: number) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(label.toUpperCase(), x, currentY);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(value || "-", x, currentY + 5);
      };

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 34, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("INVOICE", margin, y);
      pdf.setFontSize(10);
      pdf.text(`#${invoice.id}`, rightEdge, y, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.text(`Issued: ${invoice.issuedDate}`, rightEdge, y + 6, { align: "right" });
      pdf.text(`Status: ${invoice.status}`, rightEdge, y + 12, { align: "right" });

      y = 46;
      drawLabelValue("Contractor", invoice.contractor.company || invoice.contractor.name, margin, y);
      drawLabelValue("Customer", invoice.customer.company || invoice.customer.name, 112, y);
      y += 12;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text([
        invoice.contractor.name,
        invoice.contractor.street,
        `${invoice.contractor.city}, ${invoice.contractor.state} ${invoice.contractor.zip}`,
        invoice.contractor.phone,
        invoice.contractor.email,
      ].filter(Boolean), margin, y);
      pdf.text([
        invoice.customer.name,
        invoice.customer.street,
        `${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.zip}`,
        invoice.customer.phone,
        invoice.customer.email,
      ].filter(Boolean), 112, y);

      y += 34;
      ensureSpace(24);
      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y, pageWidth - margin * 2, 10, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text("DESCRIPTION", margin + 2, y + 6);
      pdf.text("QTY", 126, y + 6, { align: "right" });
      pdf.text("PRICE", 154, y + 6, { align: "right" });
      pdf.text("TOTAL", rightEdge - 2, y + 6, { align: "right" });
      y += 10;

      invoice.items.forEach((item) => {
        const descriptionLines = pdf.splitTextToSize(item.description, 92);
        const rowHeight = Math.max(10, descriptionLines.length * 5 + 4);
        ensureSpace(rowHeight);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(descriptionLines, margin + 2, y + 6);
        pdf.text(String(item.qty), 126, y + 6, { align: "right" });
        pdf.text(formatCurrency(item.price, currency), 154, y + 6, { align: "right" });
        pdf.text(formatCurrency(item.qty * item.price, currency), rightEdge - 2, y + 6, { align: "right" });

        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y + rowHeight, rightEdge, y + rowHeight);
        y += rowHeight;
      });

      y += 8;
      ensureSpace(28);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Subtotal", 145, y, { align: "right" });
      pdf.text(formatCurrency(subtotal, currency), rightEdge, y, { align: "right" });
      y += 7;
      pdf.text(`Tax (${invoice.taxRate}%)`, 145, y, { align: "right" });
      pdf.text(formatCurrency(tax, currency), rightEdge, y, { align: "right" });
      y += 9;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Total Due", 145, y, { align: "right" });
      pdf.text(formatCurrency(total, currency), rightEdge, y, { align: "right" });

      y += 16;
      if (invoice.terms || invoice.notes) {
        ensureSpace(34);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.text("PAYMENT TERMS", margin, y);
        pdf.text("NOTES", 112, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(pdf.splitTextToSize(invoice.terms || "-", 82), margin, y);
        pdf.text(pdf.splitTextToSize(invoice.notes || "-", 82), 112, y);
        y += 26;
      }

      ensureSpace(42);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text("WORKER SIGNATURE", margin, y);
      pdf.text("CUSTOMER SIGNATURE", 112, y);
      y += 4;

      if (isSignatureCaptured(invoice.workerSignature)) {
        pdf.addImage(invoice.workerSignature, "PNG", margin, y, 58, 20);
      }
      if (isSignatureCaptured(invoice.customerSignature)) {
        pdf.addImage(invoice.customerSignature, "PNG", 112, y, 58, 20);
      }

      y += 24;
      pdf.setDrawColor(148, 163, 184);
      pdf.line(margin, y, margin + 70, y);
      pdf.line(112, y, 182, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(invoice.contractor.name || "Worker", margin, y + 5);
      pdf.text(invoice.customer.name || "Customer", 112, y + 5);

      if (invoice.completedDate) {
        y += 18;
        ensureSpace(14);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.text("DATE COMPLETED", margin, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(invoice.completedDate, margin, y + 6);
      }

      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Generated via Pro Invoice V2 - ${invoice.uuid.substring(0, 8).toUpperCase()}`, margin, pageHeight - 8);

      pdf.save(`Invoice-#${invoice.id || invoice.uuid.substring(0, 8)}.pdf`);
      return true;
    } catch (e) {
      console.error("PDF download helper failed:", e);
      setPdfError("No se pudo generar el PDF. Intenta limpiar las firmas y generarlo de nuevo.");
      return false;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateAndSend = async () => {
    const downloaded = await handleDownloadPDF();
    if (!downloaded) return;

    const newStatus = workerSigned && customerSigned ? InvoiceStatus.PAID : InvoiceStatus.SENT;
    onUpdateInvoice({ ...invoice, status: newStatus });

    setIsSuccessAlert(true);
    setTimeout(() => {
      setIsSuccessAlert(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 print-container">
      {/* Back to list and helper action controls */}
      <div className="flex justify-between items-center no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Invoices
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            title="Descargar PDF de la Factura"
          >
            {isGeneratingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Printer className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isGeneratingPdf ? "Generando..." : "Imprimir / PDF"}</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {isSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-start gap-3 shadow-xs no-print animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Invoice Processed Successfully!</p>
            <p className="text-xs text-emerald-700 mt-1">
              The invoice PDF has been built, signatures were saved, and the invoice status was updated.
            </p>
          </div>
        </div>
      )}

      {pdfError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-start gap-3 shadow-xs no-print">
          <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{pdfError}</p>
        </div>
      )}

      {/* Step Indicator (matching the three-stripe mockup exactly) */}
      <div className="flex items-center gap-2 mb-4 no-print">
        <div className="h-1 w-full bg-blue-600 rounded-full" />
        <div className="h-1 w-full bg-blue-600 rounded-full" />
        <div className="h-1 w-full bg-blue-600 rounded-full" />
      </div>

      {/* Invoice Card Container */}
      <section ref={invoiceRef} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
        {/* Card Header (Identity & Status Flag) */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-950 font-sans tracking-tight">
              Invoice #{invoice.id}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5 font-mono">
              Issued: {invoice.issuedDate}
            </p>
          </div>
          <div className="bg-slate-950 px-3 py-1 rounded-full text-center">
            <span className="text-[10px] font-semibold text-white tracking-widest uppercase">
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Live Vector Mini Invoice Blueprint Rendering (Mimicking the image view perfectly as a live update) */}
        <div className="p-5 border-b border-slate-100 bg-slate-100/50 no-print no-pdf">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 max-h-[300px] overflow-y-auto aspect-[1.3] relative select-none">
            {/* watermark-like title */}
            <div className="text-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 font-mono">INVOICE PREVIEW</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600 leading-relaxed mb-4">
              <div>
                <span className="font-semibold text-slate-800 block mb-0.5">Contractor/Worker</span>
                <p className="font-bold text-slate-900">{invoice.contractor.name}</p>
                <p>{invoice.contractor.company}</p>
                <p>{invoice.contractor.street}</p>
                <p>{invoice.contractor.city}, {invoice.contractor.state} {invoice.contractor.zip}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-800 block mb-0.5">Customer</span>
                <p className="font-bold text-slate-900">{invoice.customer.name}</p>
                <p>{invoice.customer.company}</p>
                <p>{invoice.customer.street}</p>
                <p>{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}</p>
              </div>
            </div>

            {/* mini line items table */}
            <table className="w-full text-[10px] text-left border-collapse border border-slate-200 mb-4">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold">
                  <th className="p-1 border border-slate-200">Description</th>
                  <th className="p-1 border border-slate-200 text-center">Qty</th>
                  <th className="p-1 border border-slate-200 text-right">Price</th>
                  <th className="p-1 border border-slate-200 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="p-1 border border-slate-200 truncate max-w-[150px]">{item.description}</td>
                    <td className="p-1 border border-slate-200 text-center">{item.qty}</td>
                    <td className="p-1 border border-slate-200 text-right">{formatCurrency(item.price, currency)}</td>
                    <td className="p-1 border border-slate-200 text-right">{formatCurrency(item.qty * item.price, currency)}</td>
                  </tr>
                ))}
                {invoice.taxRate > 0 && (
                  <tr className="font-medium text-slate-500 bg-slate-50/30">
                    <td colSpan={3} className="p-1 border border-slate-200 text-right">Tax ({invoice.taxRate}%)</td>
                    <td className="p-1 border border-slate-200 text-right">{formatCurrency(tax, currency)}</td>
                  </tr>
                )}
                <tr className="font-bold text-slate-900 bg-slate-50">
                  <td colSpan={3} className="p-1 border border-slate-200 text-right">Total Due</td>
                  <td className="p-1 border border-slate-200 text-right font-mono">{formatCurrency(total, currency)}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[9px] text-slate-400 mt-4 pt-2 border-t border-slate-100 flex justify-between">
              <div>
                <span className="block font-medium">Worker Signature</span>
                <span className="italic block mt-1 font-mono text-[8px] text-slate-500">
                  {workerSigned ? "✓ Electronically Captured" : "✗ Pending Signature"}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-medium">Customer Signature</span>
                <span className="italic block mt-1 font-mono text-[8px] text-slate-500">
                  {customerSigned ? "✓ Electronically Captured" : "✗ Pending Signature"}
                </span>
              </div>
            </div>
            
            {/* Interactive Badge Indicator */}
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-80 uppercase">
              <span className="animate-ping h-1 w-1 rounded-full bg-white block" />
              Live Interactive Update
            </div>
          </div>
        </div>

        {/* Detailed Contractor & Customer Metadata info grids block */}
        <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 bg-white">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Contractor Details
            </span>
            <p className="text-sm font-semibold text-slate-900">{invoice.contractor.company}</p>
            <p className="text-xs text-slate-600 mt-1">{invoice.contractor.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {invoice.contractor.street}, {invoice.contractor.city}, {invoice.contractor.state} {invoice.contractor.zip}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Customer Details
            </span>
            <p className="text-sm font-semibold text-slate-900">{invoice.customer.company}</p>
            <p className="text-xs text-slate-600 mt-1">{invoice.customer.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {invoice.customer.street}, {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}
            </p>
          </div>
        </div>

        {/* Services Line Items Table (rendered nicely with appropriate widths and font weighting) */}
        <div>
          <div className="grid grid-cols-12 bg-slate-50 border-t border-b border-slate-200 p-3 px-5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="col-span-7">Service / Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-3 text-right">Price</div>
          </div>

          <div className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`grid grid-cols-12 p-4 px-5 text-sm items-center ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <div className="col-span-7 pr-4">
                  <p className="font-semibold text-slate-900">{item.description.split(" - ")[0]}</p>
                  {item.description.includes(" - ") && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.description.split(" - ")[1]}</p>
                  )}
                </div>
                <div className="col-span-2 text-right font-semibold text-slate-700 font-mono">
                  {item.qty}
                </div>
                <div className="col-span-3 text-right font-semibold text-slate-800 font-mono">
                  {formatCurrency(item.price, currency)}
                </div>
              </div>
            ))}
          </div>

          {/* Tax row if applicable */}
          {invoice.taxRate > 0 && (
            <div className="p-4 px-5 bg-slate-50 text-right flex justify-between border-t border-slate-100 text-sm">
              <span className="font-semibold text-slate-500">Tax Included ({invoice.taxRate}%)</span>
              <span className="font-bold text-slate-800 font-mono">{formatCurrency(tax, currency)}</span>
            </div>
          )}

          {/* Large Total Due Accent row matching the deep primary color of mockup */}
          <div className="p-5 bg-slate-950 text-white flex justify-between items-center transition-colors">
            <span className="text-base font-bold font-sans tracking-wide">Total Due</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-white">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Notes, Terms & Authentication Signatures Section inside Card for pristine print layout */}
        <div className="p-6 bg-white border-t border-slate-100 space-y-6">
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-b border-slate-100 pb-4">
              {invoice.terms && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Terms</span>
                  <p className="text-slate-700 italic font-medium">{invoice.terms}</p>
                </div>
              )}
              {invoice.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Administrative Comments</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Signatures & Execution row */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            {/* Worker Signature Column */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Worker Autograph</span>
              <div className="h-20 border border-slate-200 border-dashed rounded-lg bg-slate-50/50 flex items-center justify-center relative overflow-hidden p-2">
                {isSignatureCaptured(invoice.workerSignature) ? (
                  <img src={invoice.workerSignature} alt="Worker Autograph" className="h-full object-contain max-h-16" />
                ) : (
                  <div className="text-slate-400 italic text-[11px] font-sans border-b border-slate-300 w-3/4 text-center pb-1">
                    Awaiting Signature
                  </div>
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 leading-tight">{invoice.contractor.name}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider">{invoice.contractor.company || 'Service Contractor'}</p>
              </div>
            </div>

            {/* Customer Signature Column */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Customer Acceptance</span>
              <div className="h-20 border border-slate-200 border-dashed rounded-lg bg-slate-50/50 flex items-center justify-center relative overflow-hidden p-2">
                {isSignatureCaptured(invoice.customerSignature) ? (
                  <img src={invoice.customerSignature} alt="Customer Acceptance Signature" className="h-full object-contain max-h-16" />
                ) : (
                  <div className="text-slate-400 italic text-[11px] font-sans border-b border-slate-300 w-3/4 text-center pb-1">
                    Awaiting Signature
                  </div>
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 leading-tight">{invoice.customer.name}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider">{invoice.customer.company || 'Client Organization'}</p>
              </div>
            </div>
          </div>

          {invoice.completedDate && (
            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Date Completed
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
                {invoice.completedDate}
              </span>
            </div>
          )}

          <div className="text-center pt-4 border-t border-slate-200 border-dashed flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest leading-none">
              Generated & Signed via Pro Invoice V2 Utility
            </span>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest leading-none">
              License Reference: {invoice.uuid.substring(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {/* Signature Capture Section (Worker & Customer Canvas) */}
      <section className="space-y-6 no-print">
        {/* Worker Signature Canvas Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-800 uppercase tracking-wider block">
              Worker Signature
            </label>
            {workerSigned && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Captured ✓
              </span>
            )}
          </div>
          
          <div className="relative h-40 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner group">
            {/* Draw surface Canvas */}
            <canvas
              ref={workerCanvasRef}
              className="w-full h-full signature-canvas"
              title="Dibuja tu firma aquí"
            />
            {/* Mock overlay components to match image structure */}
            <div className="signature-x select-none pointer-events-none absolute bottom-4 left-4 text-xl font-bold text-slate-300 font-mono">
              X
            </div>
            <div className="absolute bottom-4 left-4 right-4 border-b border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              Touch / Drag inside grid to sign
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => clearCanvas(workerCanvasRef.current, "worker")}
              className="text-rose-600 hover:text-rose-800 font-bold text-xs py-2 flex items-center gap-1 border border-transparent hover:border-rose-100 hover:bg-rose-50 px-3 rounded-lg transition shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Signature
            </button>
          </div>
        </div>

        {/* Customer Signature Canvas Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-800 uppercase tracking-wider block">
              Customer Signature
            </label>
            {customerSigned && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Captured ✓
              </span>
            )}
          </div>

          <div className="relative h-40 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner group">
            <canvas
              ref={customerCanvasRef}
              className="w-full h-full signature-canvas"
              title="Dibuja tu firma aquí"
            />
            <div className="signature-x select-none pointer-events-none absolute bottom-4 left-4 text-xl font-bold text-slate-300 font-mono">
              X
            </div>
            <div className="absolute bottom-4 left-4 right-4 border-b border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              Touch / Drag inside grid to sign
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => clearCanvas(customerCanvasRef.current, "customer")}
              className="text-rose-600 hover:text-rose-800 font-bold text-xs py-2 flex items-center gap-1 border border-transparent hover:border-rose-100 hover:bg-rose-50 px-3 rounded-lg transition shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Signature
            </button>
          </div>
        </div>
      </section>

      {/* Primary Action Dispatch block */}
      <section className="pt-2 pb-6 no-print">
        <button
          onClick={handleGenerateAndSend}
          disabled={isGeneratingPdf}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-xl font-bold text-md flex items-center justify-center gap-3 transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          {isGeneratingPdf ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <Send className="w-5 h-5 shrink-0" />
          )}
          <span>{isGeneratingPdf ? "Generating PDF..." : "Generate PDF and Download"}</span>
        </button>
        <p className="text-center text-slate-400 font-normal text-[11px] mt-4 leading-normal">
          By clicking <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">"Generate PDF and Download"</code>, you confirm all details, payments, and captured signatures are legally binding and final.
        </p>
      </section>
    </div>
  );
};
