# WiFi Network Deployment Guide

## Overview
Your Finance Manager app is now configured to be accessible on your local WiFi network from any device.

**Your Machine's Local IP:** `192.168.1.17`

---

## Changes Made

### 1. Backend Changes
- **File:** `backend.bat` and `run.py`
- **Change:** Updated uvicorn to listen on all network interfaces
- **Command:** `--host 0.0.0.0 --port 8000`
- This allows the backend to accept connections from any device on your network, not just localhost

### 2. Frontend Changes
- **File:** `frontend/src/api/client.ts`
- **Change:** Updated API endpoint to use your local IP address
- **Default:** `http://192.168.1.17:8000/api`
- **Flexibility:** Now supports `VITE_API_URL` environment variable for custom configuration

### 3. Environment Configuration
- **File:** `frontend/.env.local` (created)
- **Purpose:** Stores the API endpoint for the frontend
- **Use Case:** Easily switch between localhost and network IP without code changes

---

## How to Deploy

### Step 1: Configure Windows Firewall
Allow port 8000 through Windows Firewall:

**Via PowerShell (Run as Administrator):**
```powershell
netsh advfirewall firewall add rule name="Finance Manager Backend" dir=in action=allow protocol=tcp localport=8000
```

**Or via GUI:**
1. Open Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → Specific local ports: 8000
4. Allow the connection
5. Apply to Domain, Private, Public

### Step 2: Start the Backend
Run one of these commands:

**Option A (Using .bat file):**
```bash
backend.bat
```

**Option B (Using run.py):**
```bash
python run.py
```

**Option C (Manual):**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start the Frontend (in another terminal)
```bash
cd frontend
npm run dev
```

Frontend will typically run on `http://localhost:5173`

### Step 4: Access from Other Devices

**From your local machine:**
- Development: `http://localhost:5173`
- Production build: `http://192.168.1.17:8000` (if serving from backend)

**From other devices on the WiFi network:**
- `http://192.168.1.17:5173` (frontend dev server)
- Or build frontend and serve static files from backend

---

## For Production Deployment (Optional)

### Build Frontend for Production
```bash
cd frontend
npm run build
```

This creates optimized static files in `frontend/dist/`

### Serve Frontend from Backend
Modify `backend/app/main.py` to serve static files:

```python
from fastapi.staticfiles import StaticFiles
import os

# At the end of app setup, add:
static_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
```

Then access via: `http://192.168.1.17:8000`

---

## Testing Connectivity

### From your machine:
```bash
curl http://192.168.1.17:8000/api/transactions/
```

### From another device on the network:
1. Open browser
2. Navigate to: `http://192.168.1.17:5173` (or appropriate port)
3. The app should load and function normally

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection Refused" | Check if backend is running and firewall allows port 8000 |
| "Can't reach from other devices" | Verify all devices are on same WiFi network, check firewall rules |
| CORS errors | CORS is already configured with `allow_origins=["*"]` in backend |
| API returns 404 | Ensure `.env.local` has correct IP: `192.168.1.17` |

---

## Notes

- **IP Address Note:** If your IP changes (due to DHCP), you'll need to update `.env.local` and restart the frontend
- **CORS:** Currently allows all origins. For production, specify allowed origins in `backend/app/main.py`
- **Security:** This setup is for local WiFi only. Don't expose to the internet without proper security measures

---

## Quick Reference Commands

```bash
# Start backend (all network interfaces)
backend.bat

# Start frontend (in another terminal)
cd frontend && npm run dev

# Test backend API
curl http://192.168.1.17:8000/api/transactions/

# Build frontend for production
cd frontend && npm run build
```
