# bokio_api — Download invoice PDFs from Bokio

Bulk-download all Bokio invoice PDFs using the official Bokio API. No browser required.

---

## Quick start

```powershell
.\download_via_api.ps1 -FromDate 2024-09-01 -ToDate 2025-08-31 -OutDir "C:\path\to\folder"
```

That's it. The script fetches every matching invoice and saves the PDF.

---

## Prerequisites

- PowerShell 5.1 or later (included in Windows 10/11)
- A Bokio **Private Integration** token (one-time setup)

---

## One-time setup

### 1. Create a Private Integration token in Bokio

1. Go to **Settings → Private integrations** in Bokio
   (`https://app.bokio.se/settings-r/private-integrations`)
2. Create a new integration and copy the token
3. Create a file named `.env` in this folder with the token as the first line:

```
YOUR_TOKEN_HERE
```

> `.env` is gitignored — it will never be committed.

### 2. Find your Company ID

Your Company ID is the UUID in the Bokio URL:

```
https://app.bokio.se/YOUR-COMPANY-ID/invoicing/invoices
```

Update `$CompanyId` in `download_via_api.ps1` if needed (default is the AIAB company).

---

## Usage

```powershell
# Download a full fiscal year
.\download_via_api.ps1 -FromDate 2024-09-01 -ToDate 2025-08-31 -OutDir "C:\Users\fredr\Dropbox\ftg\AIAB\40_kundfakturor\2024-2025"

# Download from a date with no upper limit
.\download_via_api.ps1 -FromDate 2025-09-01 -OutDir "C:\Users\fredr\Dropbox\ftg\AIAB\40_kundfakturor\2025-2026"
```

Files are saved as:

```
Faktura_{number}_{YYYY-MM-DD}_{customer}.pdf
```

---

## How it works

```
PowerShell script
  └─ GET api.bokio.se/v1/companies/{id}/invoices   →  paginated invoice list
  └─ GET api.bokio.se/v1/companies/{id}/invoices/{invoiceId}/download  →  PDF
```

Authentication: `Authorization: Bearer <token>` (raw token value from `.env`).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `401 Unauthorized` | Token is wrong or expired — regenerate it in Bokio settings |
| `0 invoices found` | Check date range; drafts are excluded automatically |
| Token missing | Create `.env` with the token as the first line |

---

## Browser fallback

The `browser/` folder contains scripts for downloading via the DevTools console (F12).
These use Bokio's undocumented internal browser API and require manual pasting.
Use this only if the PowerShell script is unavailable.

---

## Disclaimer

The `/download` endpoint is part of Bokio's official API but is undocumented in the public reference.
Use at your own risk. This project is not affiliated with Bokio.
