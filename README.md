# bokio_api — Download invoice PDFs from Bokio

Bokio does not offer bulk PDF export. This guide shows how to download all your invoice PDFs in one go — using your browser's own authenticated session. No API keys, no third-party tools, no scraping.

**Tested with:** Chrome on Windows. Should work on Mac/Linux with minor path adjustments.

---

## How it works

Bokio's web app exposes an internal JavaScript object (`window.bokioProxy`) that is accessible from the browser console while you are logged in. We use it to fetch the full invoice list (including UUIDs), then download each PDF directly from Bokio's server using the browser's active session.

```
Browser console
  └─ window.bokioProxy  →  invoice list (UUIDs, numbers, dates, customers)
  └─ fetch /Invoices/Invoice/LatestPdf/{uuid}  →  PDF blob  →  saved to disk
```

---

## Prerequisites

- Chrome (logged in to Bokio)
- Python 3 (for the one-time Chrome settings step)
- [Claude in Chrome extension](https://chromewebstore.google.com/detail/claude-in-chrome/phmfkekbokbiknlglcecnigfpklckelh) *(recommended — lets Claude run the scripts for you)*

---

## One-time setup: grant Claude in Chrome access to Bokio

The scripts run in your browser's JavaScript console. The easiest way is to let Claude handle that automatically via the Claude in Chrome extension — but it needs permission for `app.bokio.se` first.

1. Go to `https://app.bokio.se` in Chrome
2. Click the **puzzle piece icon** in the toolbar → find **Claude in Chrome**
3. Click **"Allow on this site"**

That's it. Claude can now run the scripts on Bokio pages automatically. You only need to do this once per browser profile.

> **No extension?** You can also paste the scripts manually in the browser console (F12 → Console). See [Manual console method](#manual-console-method) at the bottom of this page.

---

## Step 1 — Find your Company ID

Log in to Bokio. Your Company ID is the UUID visible in the URL:

```
https://app.bokio.se/YOUR-COMPANY-ID/invoicing/invoices
```

Copy it — you will use it in Step 3.

---

## Step 2 — Configure Chrome download folder

By default Chrome shows a *Save As* dialog for every download. This step disables it and points Chrome at your target folder.

> ⚠️ **Close Chrome completely before running this script.**

1. Edit `set_chrome_prefs.py` and set `SAVE_DIR` to the folder where you want the PDFs.
2. Run the script:

```bash
python set_chrome_prefs.py
```

3. Open Chrome and log in to Bokio again.

> **Mac users:** change `prefs_path` in the script to:
> `~/Library/Application Support/Google/Chrome/Default/Preferences`

---

## Step 3 — Get the invoice list

Open the Bokio invoices page:

```
https://app.bokio.se/YOUR-COMPANY-ID/invoicing/invoices
```

Open the browser console (**F12 → Console**).

Paste the three scripts **in order**, pressing Enter after each one:

1. **`config.js`** — your company ID and date range (paste this first)
2. **`get_invoice_list.js`** — fetches all invoice UUIDs
3. **`download_pdfs.js`** — downloads the PDFs

After step 2 you will see a summary in the console. After step 3, Chrome starts downloading.

> Do not refresh the page between steps — the invoice list is stored in memory.

> If you have more than 500 invoices, increase `pageSize` in `get_invoice_list.js`.

---

## Step 4 — Download all PDFs

In the **same** console session (do not refresh the page), paste the contents of `download_pdfs.js` and press Enter.

Chrome will download each invoice to your target folder, named:

```
Faktura_{number}_{date}_{customer}.pdf
```

A progress log appears in the console. Draft invoices are automatically skipped.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `window.bokioProxy is undefined` | Make sure you are on the Bokio invoices page and logged in |
| `Permission denied for JavaScript execution` | The Claude in Chrome extension needs access to `app.bokio.se`. Click the puzzle piece icon → Claude in Chrome → **Allow on this site**, then try again |
| Save As dialog still appears | Chrome was open when you ran `set_chrome_prefs.py` — close Chrome and run again |
| Some invoices missing | Check the console for errors; they may be drafts (excluded by design) |
| HTTP 401 errors | Your session expired — refresh the page and run the scripts again |

---

## File naming

Downloaded files follow this pattern:

```
Faktura_{invoice_number}_{YYYY-MM-DD}_{customer_name}.pdf
```

Special characters in customer names are replaced with underscores. Names are truncated at 40 characters.

---

## Manual console method

If you prefer not to use the Claude in Chrome extension, you can paste the scripts directly in the browser console:

1. Open `https://app.bokio.se/YOUR-COMPANY-ID/invoicing/invoices`
2. Press **F12** → go to the **Console** tab
3. Paste `config.js` → Enter
4. Paste `get_invoice_list.js` → Enter
5. Paste `download_pdfs.js` → Enter

No extension or additional setup needed. The scripts work the same way.

---

## Disclaimer

This uses Bokio's **internal, undocumented browser API**. It may break without notice if Bokio updates their web app. Use at your own risk. This project is not affiliated with Bokio.
