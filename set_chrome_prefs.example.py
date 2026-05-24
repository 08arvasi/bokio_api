#!/usr/bin/env python3
"""
set_chrome_prefs.example.py
----------------------------
Copy this file to set_chrome_prefs.py and set SAVE_DIR to your target folder.
set_chrome_prefs.py is gitignored — your local paths stay local.

CLOSE CHROME COMPLETELY before running.
"""

import json
import sys
from pathlib import Path

# ── Edit this ──────────────────────────────────────────────────────────────
SAVE_DIR = r'C:\Users\YourName\Documents\Bokio PDFs'
# ───────────────────────────────────────────────────────────────────────────

# Default Chrome profile path (Windows)
prefs_path = Path.home() / 'AppData/Local/Google/Chrome/User Data/Default/Preferences'

# Mac:   ~/Library/Application Support/Google/Chrome/Default/Preferences
# Linux: ~/.config/google-chrome/Default/Preferences

if not prefs_path.exists():
    sys.exit(
        f'Chrome Preferences file not found at:\n  {prefs_path}\n'
        'Check that Chrome is installed and has been opened at least once.'
    )

with open(prefs_path, 'r', encoding='utf-8') as f:
    prefs = json.load(f)

prefs.setdefault('download', {}).update({
    'prompt_for_download': False,
    'default_directory': SAVE_DIR,
})
prefs.setdefault('savefile', {})['default_directory'] = SAVE_DIR

with open(prefs_path, 'w', encoding='utf-8') as f:
    json.dump(prefs, f, separators=(',', ':'))

print(f'Done. Chrome will now save PDFs directly to:\n  {SAVE_DIR}')
print('Open Chrome and continue to Step 3.')
