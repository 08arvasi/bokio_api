// config.example.js
// ------------------
// Copy this file to config.js and fill in your values.
// config.js is gitignored — your credentials stay local.
//
// Paste config.js in the browser console FIRST,
// then paste get_invoice_list.js, then download_pdfs.js.

window.BOKIO_CONFIG = {
  // Your Bokio Company ID — visible in the URL:
  // https://app.bokio.se/{companyId}/invoicing/invoices
  companyId: 'YOUR-COMPANY-ID-HERE',

  // Only download invoices with InvoiceDate >= this date
  fromDate: '2024-01-01',
};
