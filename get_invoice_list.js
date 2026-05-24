// get_invoice_list.js
// -------------------
// Fetches all invoice IDs from Bokio's internal API and stores
// them in window.__invoiceIds for use by download_pdfs.js.
//
// Run this in the browser console at:
//   https://app.bokio.se/{YOUR-COMPANY-ID}/invoicing/invoices

// ── Edit these ─────────────────────────────────────────────────────────────
const COMPANY_ID = 'YOUR-COMPANY-ID-HERE'; // e.g. '10bf9ac1-6e34-4b9d-8156-d2b8682245ee'
const FROM_DATE  = '2024-01-01';            // Only include invoices from this date onwards
// ───────────────────────────────────────────────────────────────────────────

console.log('Fetching invoice list from Bokio...');

const result = await window.bokioProxy.Invoices.InvoiceController.All.Get(
  COMPANY_ID,
  { pageIndex: 0, pageSize: 500 }
);

// Inspect result.Model if field names differ in your Bokio version:
// console.log(result.Model.Invoices[0]);

const all = result.Model.Invoices;

window.__invoiceIds = all
  .filter(inv => inv.Status !== 'Draft' && inv.InvoiceDate >= FROM_DATE)
  .map(inv => ({
    id:       inv.Id,
    nr:       inv.InvoiceNumber,
    date:     inv.InvoiceDate.slice(0, 10),
    customer: inv.CustomerName,
    status:   inv.Status
  }));

const excluded = all.length - window.__invoiceIds.length;
console.log(`Found ${window.__invoiceIds.length} invoices (${excluded} excluded: drafts or before ${FROM_DATE})`);
console.table(window.__invoiceIds.slice(0, 5));
console.log('Ready. Run download_pdfs.js to start downloading.');
