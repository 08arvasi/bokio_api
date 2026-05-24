// get_invoice_list.js
// -------------------
// Fetches all invoice IDs from Bokio's internal API and stores
// them in window.__invoiceIds for use by download_pdfs.js.
//
// Run order in browser console:
//   1. config.js          (your company ID and date filter)
//   2. get_invoice_list.js
//   3. download_pdfs.js

if (!window.BOKIO_CONFIG) {
  throw new Error('Paste config.js in the console first.');
}

const { companyId, fromDate } = window.BOKIO_CONFIG;

console.log(`Fetching invoices for company ${companyId} from ${fromDate}...`);

const result = await window.bokioProxy.Invoices.InvoiceController.All.Get(
  companyId,
  { pageIndex: 0, pageSize: 500 }
);

// Uncomment to inspect the raw response if field names differ:
// console.log(result.Model.Invoices[0]);

const all = result.Model.Invoices;

window.__invoiceIds = all
  .filter(inv => inv.Status !== 'Draft' && inv.InvoiceDate >= fromDate)
  .map(inv => ({
    id:       inv.Id,
    nr:       inv.InvoiceNumber,
    date:     inv.InvoiceDate.slice(0, 10),
    customer: inv.CustomerName,
    status:   inv.Status
  }));

const excluded = all.length - window.__invoiceIds.length;
console.log(`Found ${window.__invoiceIds.length} invoices (${excluded} excluded: drafts or before ${fromDate})`);
console.table(window.__invoiceIds.slice(0, 5));
console.log('Ready. Paste download_pdfs.js to start downloading.');
