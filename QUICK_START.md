# Quick Start Guide

## How to Run the Plant QR System

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. **Restart your computer** after installation

### Step 2: Verify Installation
Open PowerShell or Command Prompt and type:
```
node --version
npm --version
```
If you see version numbers, you're good to go!

### Step 3: Open Project Folder
1. Navigate to: `c:\Users\Owais\Desktop\plant QR`
2. Right-click in the folder → **"Open in Terminal"** or **"Open PowerShell here"**
3. Or open PowerShell manually and type:
   ```
   cd "c:\Users\Owais\Desktop\plant QR"
   ```

### Step 4: Install Dependencies
In PowerShell/Terminal, type:
```
npm install
```
Wait 1-2 minutes for packages to download...

### Step 5: Start the Server
Type:
```
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 6: Open in Browser
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. You should see the **Login Page**

### Step 7: Login

Choose your login type and use the credentials:

**Administrator:**
- Select **"Administrator"** button
- Email: `admin@plantqr.com`
- Password: `admin123`

**User:**
- Select **"User"** button
- Email: `user@plantqr.com`
- Password: `user123`

Click **Sign In** after entering credentials

### You're In!
Now you can explore:
- **Dashboard** - Overview of your plants
- **Plants** - View all plants
- **Add Plant** - Register new plants
- **QR Generator** - Create QR codes
- **Profile** - Manage settings

---

## To Stop the Server
Press `Ctrl + C` in the terminal

---

## Troubleshooting

### "npm is not recognized"
→ Node.js is not installed or not in PATH
→ Install Node.js from nodejs.org and restart your computer

### "Port 3000 is already in use"
→ Another application is using port 3000
→ The server will use a different port (check terminal output)
→ Or close the application using port 3000

### Installation takes too long
→ This is normal for the first time
→ npm is downloading all required packages (~200MB)

### Browser shows "Cannot connect"
→ Make sure the server is running (Step 5)
→ Check the URL in the terminal output
→ Try refreshing the page

---

## Need Help?
- Check the main README.md file
- Make sure all prerequisites are installed
- Restart your terminal after installing Node.js
