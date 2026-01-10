# Google Drive Backup Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `Finance Manager Backup`
5. Click **CREATE**
6. Wait for the project to be created, then select it

## Step 2: Enable Google Drive API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and click **ENABLE**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, first click **CREATE CONSENT SCREEN**
   - Choose **External** user type
   - Fill in app name: `Finance Manager`
   - Add your email as test user
   - Save and continue
4. Return to Credentials and create **OAuth client ID**
5. Select **Desktop application**
6. Click **CREATE**
7. Click **DOWNLOAD JSON** (or the download icon)
8. Rename the downloaded file to `credentials.json`
9. **Move `credentials.json` to the `backend/` folder** (same location as `backup_db.py`)

## Step 4: First-Time Authentication

1. Open terminal in the `backend/` folder
1. Make sure the `backend/config.json` file have the proper data in `google_drive` field.
2. Make sure your virtual environment is activated
3. Run:
   ```bash
   python backup_db.py
   ```
4. A browser window will automatically open
5. Sign in with your Google account
6. Click **ALLOW** to grant access to Google Drive
7. A file named `token.json` will be created automatically in `backend/`
8. You're all set!

## Step 5: Use the Backup Script

### Backup your database to Google Drive:
```python
from backup_db import GDriveBackup
import json

with open('config.json') as f:
    config = json.load(f)

google_drive_config = config.get("google_drive", {})
backup = GDriveBackup(google_drive_config)

# Backup only if 7+ days since last backup [for weekly]
backup.backup_local_db(google_drive_config.get("backup_file", './finance.db'))
```

### Or run directly:
```bash
python backup_db.py
```

## File Structure After Setup

```
backend/
  credentials.json    ← Downloaded from Google Cloud
  token.json          ← Created automatically after first run
  backup_db.py
  config.json         ← Details needed to run the backup_db.py
  ...
```

## Features

- ✅ Automatically creates a `Finance_Manager_Backups` folder in Google Drive
- ✅ Backs up with timestamp: `finance_manager_backup_20260110_143022.db`
- ✅ Token refresh happens automatically for future runs
- ✅ No need to authenticate again after first time

## Troubleshooting

**"credentials.json not found"**
- Make sure you downloaded and renamed the file correctly
- Place it in the `backend/` folder

**"Browser doesn't open for authentication"**
- Manually visit the URL shown in the terminal
- Or check if another browser window opened in the background

**"Permission denied"**
- Delete `token.json` and run the script again
- This will force re-authentication

**"ModuleNotFoundError: No module named 'google'"**
- Install required packages:
  ```bash
  pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
  ```
