"""
Google Drive Backup Manager for Finance Manager Database

SETUP INSTRUCTIONS:
1. Create a Google Cloud Project:
   - Go to https://console.cloud.google.com/
   - Create a new project
   - Enable Google Drive API

2. Create OAuth 2.0 Credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop application"
   - Download the JSON file and rename it to "credentials.json"
   - Place it in the backend/ directory

3. First Run:
   - Run this script for the first time
   - A browser window will open asking for permission
   - Grant access to your Google Drive
   - token.json will be created automatically
   - Future runs will use token.json for authentication
"""

import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.api_core.exceptions import GoogleAPIError
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
import os
import io
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

SCOPES = ['https://www.googleapis.com/auth/drive']

class GDriveBackup:
    def __init__(self, google_drive_config=None):
        """Initialize GDriveBackup with optional config."""
        self.credentials_path = google_drive_config.get("credentials_file", None)
        self.token_path = google_drive_config.get("token_file", None)
        self.frequency = google_drive_config.get("backup_frequencies", "weekly")
        self.service = None
        assert self.credentials_path is not None, "Credentials file path must be provided in config."
        
    def authenticate(self):
        """Authenticate with Google Drive API"""
        creds = None
        
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        
        self.service = build('drive', 'v3', credentials=creds)
    
    def backup_files(self, backup_dir='./gdrive_backup'):
        """Download all files from Google Drive"""
        if not self.service:
            self.authenticate()
        
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        try:
            results = self.service.files().list(
                pageSize=100,
                fields='files(id, name, mimeType)',
                trashed=False
            ).execute()
            
            files = results.get('files', [])
            
            for file in files:
                self._download_file(file['id'], file['name'], backup_dir)
                
            print(f"✓ Backup completed at {backup_dir}")
            
        except GoogleAPIError as e:
            print(f"✗ Error: {e}")
    
    def _download_file(self, file_id, file_name, backup_dir):
        """Download a single file"""
        try:
            request = self.service.files().get_media(fileId=file_id)
            file_path = os.path.join(backup_dir, file_name)
            
            with open(file_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while not done:
                    done = downloader.next_chunk()
            
            print(f"✓ Downloaded: {file_name}")
        except Exception as e:
            print(f"✗ Failed to download {file_name}: {e}")
    
    def _should_backup(self, folder_name):
        """Check if backup should be performed based on frequency and last backup date.
        
        Args:
            folder_name: Name of the backup folder in Google Drive
            frequency: 'weekly' (7 days) or 'monthly' (30 days)
        
        Returns:
            tuple: (should_backup: bool, last_backup_info: dict or None)
        """
        if self.frequency not in ['weekly', 'monthly']:
            print(f"✗ Invalid self.frequency: {self.frequency}. Use 'weekly' or 'monthly'")
            return False, None
        
        try:
            # Get the backup folder
            results = self.service.files().list(
                q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=False",
                spaces='drive',
                fields='files(id)',
                pageSize=1
            ).execute()
            
            folders = results.get('files', [])
            if not folders:
                print("✓  No backup folder found. First backup will be created.")
                return True, None
            
            folder_id = folders[0]['id']
            
            # Get the most recent backup file
            results = self.service.files().list(
                q=f"'{folder_id}' in parents and name contains 'finance_manager_backup_' and trashed=False",
                spaces='drive',
                fields='files(id, name, createdTime)',
                pageSize=1,
                orderBy='createdTime desc'
            ).execute()
            
            files = results.get('files', [])
            if not files:
                print("✓  No previous backup found. Creating first backup.")
                return True, None
            
            last_backup = files[0]
            last_backup_time = datetime.fromisoformat(last_backup['createdTime'].replace('Z', '+00:00'))
            last_backup_time = last_backup_time.replace(tzinfo=None)  # Remove timezone info
            current_time = datetime.now()
            
            # Determine interval based on self.frequency
            if self.frequency == 'weekly':
                interval_days = 7
            else:  # monthly
                interval_days = 30
            
            time_diff = current_time - last_backup_time
            
            if time_diff.days >= interval_days:
                print(f"✓  Last backup was {time_diff.days} days ago. Creating new {self.frequency} backup.")
                return True, {
                    'name': last_backup['name'],
                    'created': last_backup_time,
                    'days_since': time_diff.days
                }
            else:
                days_until_next = interval_days - time_diff.days
                print(f"ℹ  Last backup was {time_diff.days} days ago. Next {self.frequency} backup in {days_until_next} day(s).")
                return False, {
                    'name': last_backup['name'],
                    'created': last_backup_time,
                    'days_since': time_diff.days
                }
            
        except GoogleAPIError as e:
            print(f"✗ Error checking backup status: {e}")
            return True, None  # Proceed with backup if error checking
    
    def backup_local_db(self, db_path='./finance.db', folder_name='Finance_Manager_Backups'):
        """Upload local database file to Google Drive.
        
        Args:
            db_path: Path to the database file
            folder_name: Name of the backup folder in Google Drive
            frequency: 'weekly', 'monthly', or None to always backup (default: None)
        """
        if not self.service:
            self.authenticate()
        
        # Check frequency if specified
        if self.frequency is not None:
            should_backup, _ = self._should_backup(folder_name)
            if not should_backup:
                return False
        
        if not os.path.exists(db_path):
            print(f"✗ Database file not found: {db_path}")
            return False
        
        try:
            # Create or find the backup folder
            folder_id = self._get_or_create_folder(folder_name)
            
            # Create backup filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f'finance_manager_backup_{timestamp}.db'
            
            # Upload file
            file_metadata = {
                'name': backup_filename,
                'parents': [folder_id]
            }
            media = MediaFileUpload(db_path, mimetype='application/octet-stream')
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, createdTime'
            ).execute()
            
            print("✓  Database backed up successfully!")
            print(f"  File: {file.get('name')}")
            print(f"  Folder: {folder_name}")
            print(f"  Google Drive ID: {file.get('id')}")
            return True
            
        except GoogleAPIError as e:
            print(f"✗ Backup failed: {e}")
            return False
    
    def _get_or_create_folder(self, folder_name):
        """Get existing folder or create a new one in Google Drive"""
        try:
            # Search for existing folder
            results = self.service.files().list(
                q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=False",
                spaces='drive',
                fields='files(id, name)',
                pageSize=1
            ).execute()
            
            folders = results.get('files', [])
            if folders:
                return folders[0]['id']
            
            # Create new folder if not found
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            folder = self.service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            print(f"✓ Created backup folder: {folder_name}")
            return folder.get('id')
            
        except GoogleAPIError as e:
            print(f"✗ Error managing folder: {e}")
            return None

if __name__ == '__main__':
    with open('config.json') as f:
        config = json.load(f)

    google_drive_config = config.get("google_drive", {})
    backup = GDriveBackup(google_drive_config)
    
    # Backup only if 7+ days since last backup
    backup.backup_local_db(google_drive_config.get("backup_file", './finance.db'))
    
    # Backup only if 30+ days since last backup
    # backup.backup_local_db('./finance.db', frequency='monthly')
    
    # Optional: Download all files from Google Drive
    # backup.backup_files()