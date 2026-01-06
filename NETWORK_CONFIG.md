# Network Configuration Guide

## Accessing the Finance Manager from Other Devices

To access the Finance Manager app from other devices on your local network, you need to configure the API URL to point to the actual IP address of the server instead of `localhost`.

### Step 1: Find Your Server's IP Address

**On Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (usually something like `192.168.x.x`)

**On macOS/Linux:**
```bash
ifconfig
```
Look for `inet` address

### Step 2: Update the Frontend Configuration

Edit the file: `frontend/.env`

Replace the IP address with your actual server IP:
```
VITE_API_URL=http://YOUR_SERVER_IP:8000/api
```

Example:
```
VITE_API_URL=http://192.168.1.17:8000/api
```

### Step 3: Ensure Backend is Accessible

The backend FastAPI server must be running and accessible on the network. Make sure your firewall allows traffic on port 8000.

**Run the backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The `--host 0.0.0.0` flag makes the server accessible from any network interface.

### Step 4: Access from Other Device

From another device on the same network, open your browser and navigate to:
```
http://YOUR_SERVER_IP:5173
```

Example:
```
http://192.168.1.17:5173
```

### Step 5: Run the Frontend

```bash
cd frontend
npm run dev
```

## Environment Files

- **`.env`**: Default environment variables (for production/network deployment)
- **`.env.local`**: Local development overrides (used locally, not committed to git)

To use localhost for local development, create a `.env.local` file:
```
VITE_API_URL=http://localhost:8000/api
```

## Troubleshooting

1. **"Cannot reach the server"**: 
   - Verify the server IP address is correct
   - Check that the backend is running with `--host 0.0.0.0`
   - Ensure firewall allows port 8000

2. **"CORS error"**: 
   - The backend already has CORS enabled for all origins
   - This should not be an issue

3. **"Invalid credentials after login"**:
   - Check that both devices are using the correct API URL
   - Verify the username/password in `backend/config.json` on the server device
