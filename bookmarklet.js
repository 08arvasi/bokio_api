// bookmarklet.js
// --------------
// Self-contained version of config + get_invoice_list + download_pdfs.
// Paste into the browser console OR save as a javascript: bookmark.
//
// Prompts for date range — no config.js required.
// Works on any Bokio company page (app.bokio.se).

(async () => {
  const companyId = '10bf9ac1-6e34-4b9d-8156-d2b8682245ee';
  const fromDate  = prompt('Från datum (ÅÅÅÅ-MM-DD):', '2025-09-01');
  if (!fromDate) return;
  const toDate = prompt('Till datum (ÅÅÅÅ-MM-DD, lämna tomt för alla):', '') || null;

  const rangeLabel = toDate ? `${fromDate} – ${toDate}` : `från ${fromDate}`;
  console.log(`Hämtar fakturor ${rangeLabel}...`);

  const result = await window.bokioProxy.Invoices.InvoiceController.All.Get(
    companyId, { pageIndex: 0, pageSize: 500 }
  );
  const all = result.Model.Invoices;

  const invoices = all
    .filter(inv =>
      inv.Status !== 'Draft' &&
      inv.InvoiceDate >= fromDate &&
      (!toDate || inv.InvoiceDate <= toDate + 'T23:59:59')
    )
    .map(inv => ({
      id:       inv.Id,
      nr:       inv.InvoiceNumber,
      date:     inv.InvoiceDate.slice(0, 10),
      customer: inv.CustomerName,
    }));

  console.log(`Hittade ${invoices.length} fakturor (${all.length - invoices.length} exkluderade: utkast eller utanför datumintervall)`);
  console.table(invoices.slice(0, 5));
  if (!invoices.length) { console.warn('Inga fakturor att ladda ner.'); return; }

  function sanitize(s) {
    return (s || '')
      .replace(/[^\wåäöÅÄÖéèêë\-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 40)
      .replace(/_$/, '');
  }

  const queue = [...invoices];
  const total = queue.length;
  let done = 0, errors = 0;
  console.log(`Startar nedladdning av ${total} fakturor...`);

  while (queue.length > 0) {
    const batch   = queue.splice(0, 2);
    const results = await Promise.allSettled(batch.map(async inv => {
      const resp = await fetch(`/Invoices/Invoice/LatestPdf/${inv.id}`, { credentials: 'include' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob     = await resp.blob();
      const filename = `Faktura_${inv.nr}_${inv.date}_${sanitize(inv.customer)}.pdf`;
      const a        = document.createElement('a');
      a.href         = URL.createObjectURL(blob);
      a.download     = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return filename;
    }));

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') { done++;   console.log(`[${done}/${total}] OK  ${r.value}`); }
      else                          { errors++; console.error(`[${done + errors}/${total}] ERR faktura ${batch[i].nr}: ${r.reason}`); }
    });

    if (queue.length > 0) await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nKlart! ${done} nedladdade, ${errors} fel.`);
})();
