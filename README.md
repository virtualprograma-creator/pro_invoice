# Pro Invoice V2

Local invoice manager built with Vite, React, TypeScript, Tailwind CSS, and jsPDF.

## Features

- Create and manage invoices, customers, and contractors.
- Save data locally in the browser with recovery-safe defaults.
- Capture worker and customer signatures on canvas.
- Generate downloadable PDF invoices.
- Configure default currency, tax rate, and payment terms.

## Run Locally

Prerequisite: Node.js.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Notes

This app stores data in browser `localStorage`. It does not send emails or sync to a server.
