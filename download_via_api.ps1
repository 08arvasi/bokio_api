# download_via_api.ps1
# --------------------
# Downloads invoice PDFs from Bokio using the official API.
# Requires a Private Integration token in .env (first line, raw base64).
#
# Usage:
#   .\download_via_api.ps1 -FromDate 2024-09-01 -ToDate 2025-08-31 -OutDir "C:\path\to\folder"

param(
    [string]$FromDate = "2025-09-01",
    [string]$ToDate   = "",
    [string]$OutDir   = "C:\Users\fredr\Dropbox\ftg\AIAB\40_kundfakturor\2025-2026"
)

$ErrorActionPreference = "Stop"
$CompanyId = "10bf9ac1-6e34-4b9d-8156-d2b8682245ee"
$BaseUrl   = "https://api.bokio.se/v1/companies/$CompanyId"
$PageSize  = 100
$Concurrency = 3

# --- Token ---
$EnvFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $EnvFile)) { throw ".env not found at $EnvFile" }
$Token = (Get-Content $EnvFile -First 1).Trim()
$Headers = @{ Authorization = "Bearer $Token"; Accept = "application/json" }

# --- Output folder ---
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
    Write-Host "Created folder: $OutDir"
}

# --- Fetch all invoices (paginated) ---
Write-Host "Fetching invoice list..."
$all = [System.Collections.Generic.List[object]]::new()
$page = 1
do {
    $url  = "$BaseUrl/invoices?pageSize=$PageSize&page=$page"
    $resp = Invoke-RestMethod -Uri $url -Headers $Headers -Method GET
    $all.AddRange($resp.items)
    $totalPages = $resp.totalPages
    Write-Host "  Page $page/$totalPages ($($all.Count)/$($resp.totalItems))"
    $page++
} while ($page -le $totalPages)

# --- Filter by date ---
$filtered = $all | Where-Object {
    $d = $_.invoiceDate
    $status = $_.status
    $status -eq "published" -and
    $d -ge $FromDate -and
    ($ToDate -eq "" -or $d -le $ToDate)
}

$range = if ($ToDate) { "$FromDate - $ToDate" } else { "from $FromDate" }
Write-Host ""
Write-Host "Found $($filtered.Count) invoices ($range), excluding drafts."
if ($filtered.Count -eq 0) { Write-Host "Nothing to download."; exit 0 }

# --- Download PDFs ---
function Sanitize([string]$s) {
    ($s -replace '[^\w\-]', '_') -replace '_+', '_' -replace '_$', '' |
    ForEach-Object { if ($_.Length -gt 40) { $_.Substring(0,40) } else { $_ } }
}

$done = 0; $errors = 0; $total = $filtered.Count

foreach ($inv in $filtered) {
    $customer = Sanitize $inv.customerRef.name
    $filename = "Faktura_$($inv.invoiceNumber)_$($inv.invoiceDate)_$customer.pdf"
    $outPath  = Join-Path $OutDir $filename

    try {
        Invoke-WebRequest -Uri "$BaseUrl/invoices/$($inv.id)/download" `
            -Headers $Headers -Method GET -OutFile $outPath
        $done++
        Write-Host "[$done/$total] OK  $filename"
    } catch {
        $errors++
        Write-Warning "[$($done+$errors)/$total] ERR $($inv.invoiceNumber): $_"
    }
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Done! $done downloaded, $errors errors."
Write-Host "Saved to: $OutDir"
