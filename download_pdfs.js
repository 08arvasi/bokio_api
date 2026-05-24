// download_pdfs.js
// ----------------
// Downloads all invoices collected by get_invoice_list.js as PDFs.
// Run this in the same console session, immediately after get_invoice_list.js.
//
// Files are saved as: Faktura_{number}_{date}_{customer}.pdf

if (!window.__invoiceIds || !window.__invoiceIds.length) {
  throw new Error('Run get_invoice_list.js first to populate window.__invoiceIds.');
}

const CONCURRENCY = 2;   // simultaneous downloads
const PAUSE_MS    = 300; // pause between batches (ms) — be gentle with the server

function sanitize(s) {
  return (s || '')
    .replace(/[^\wåäöÅÄÖéèêë\-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
    .replace(/_$/, '');
}

async function downloadPdf(inv) {
  const url      = `/Invoices/Invoice/LatestPdf/${inv.id}`;
  const filename = `Faktura_${inv.nr}_${inv.date}_${sanitize(inv.customer)}.pdf`;

  const resp = await fetch(url, { credentials: 'include' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const blob    = await resp.blob();
  const a       = document.createElement('a');
  a.href        = URL.createObjectURL(blob);
  a.download    = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  return filename;
}

const queue  = [...window.__invoiceIds];
const total  = queue.length;
let done = 0, errors = 0;

console.log(`Starting download of ${total} invoices...`);

async function runBatch() {
  while (queue.length > 0) {
    const batch   = queue.splice(0, CONCURRENCY);
    const results = await Promise.allSettled(batch.map(downloadPdf));

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        done++;
        console.log(`[${done}/${total}] OK  ${r.value}`);
      } else {
        errors++;
        console.error(`[${done + errors}/${total}] ERR invoice ${batch[i].nr}: ${r.reason}`);
      }
    });

    if (queue.length > 0) await new Promise(r => setTimeout(r, PAUSE_MS));
  }

  console.log(`\nDone! ${done} downloaded, ${errors} errors.`);
}

runBatch();
