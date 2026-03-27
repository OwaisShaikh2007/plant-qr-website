# Plant QR System

A modern web application for managing plants with QR code integration. This system allows you to register plants and generate QR codes for plant information.

## Features

- **Authentication** - Secure login system
- **Dashboard** - Overview of plants and statistics
- **Plant Management** - Add, view, and manage plant information
- **QR Code Generator** - Generate QR codes for plants
- **Profile Management** - User profile and settings
- **Statistics** - Plant data and overview

## Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation and routing
- **Vite** - Build tool and dev server
- **qrcode.react** - QR code generation
- **CSS3** - Modern styling with CSS variables

## Getting Started

### Prerequisites

1. **Install Node.js** (if you haven't already):
   - Download from: https://nodejs.org/ (Version 16 or higher)
   - Run the installer and follow the setup wizard
   - Verify installation by opening PowerShell/Terminal and running:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers for both commands

### Installation & Running

1. **Open PowerShell or Terminal** in the project folder:
   - Navigate to: `c:\Users\Owais\Desktop\plant QR`
   - Or right-click in the folder → "Open in Terminal" / "Open PowerShell here"

2. **Install dependencies** (this downloads all required packages):
   ```bash
   npm install
   ```
   This may take 1-2 minutes the first time

3. **Configure SMS (Optional)**:
   - See `FAST2SMS_SETUP.md` for Fast2SMS integration setup
   - Without configuration, the system runs in demo mode (OTP shown in popup)

4. **Start the application**:
   
   **Option A: Run both server and frontend together** (Recommended):
   ```bash
   npm run dev:full
   ```
   
   **Option B: Run separately**:
   ```bash
   # Terminal 1 - Backend Server
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```
   
   Frontend: `http://localhost:3000`
   Backend API: `http://localhost:3001`

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

5. **Login** - Choose your login type:
   
   **Administrator:**
   - Select "Administrator"
   - Email: `admin@plantqr.com`
   - Password: `admin123`
   
   **User:**
   - Select "User"
   - Email: `user@plantqr.com`
   - Password: `user123`

### Troubleshooting

**If `npm` is not recognized:**
- Make sure Node.js is installed (download from nodejs.org)
- Restart your terminal/PowerShell after installing Node.js
- Try using `npm.cmd` instead of `npm` on Windows

**If port 3000 is already in use:**
- The server will automatically use another port (check the terminal output)
- Or kill the process using port 3000

**To stop the server:**
- Press `Ctrl + C` in the terminal

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Login

The system supports two types of users: **Administrator** and **User**

#### Administrator Login
- Select "Administrator" login type
- Email: `admin@plantqr.com`
- Password: `admin123`

#### User Login
- Select "User" login type
- Email: `user@plantqr.com`
- Password: `user123`

**Note:** Administrators have access to all features including adding new plants. Regular users can view plants and generate QR codes but cannot add new plants.

### Features Overview

1. **Dashboard** - View statistics and recent plants
2. **Plants** - Browse and search all registered plants
3. **Add Plant** - Register a new plant with detailed information
4. **QR Generator** - Create QR codes for plants that link to plant information
5. **Profile** - Manage account settings and preferences

## Project Structure

```
plant-qr-system/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx       # Main layout with sidebar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   ├── Dashboard.jsx    # Dashboard overview
│   │   ├── PlantList.jsx    # List of all plants
│   │   ├── PlantDetails.jsx # Individual plant details
│   │   ├── AddPlant.jsx     # Add new plant form
│   │   ├── QRGenerator.jsx  # QR code generator
│   │   └── Profile.jsx      # User profile
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Future Enhancements

- Backend API integration
- Real database for plant storage
- Cloud storage for QR codes
- Advanced analytics and reporting
- Mobile app support
- Multi-user support with roles
- QR code scanning via mobile camera
- Plant image uploads
- Location mapping with GPS

## License

This project is open source and available under the MIT License.
