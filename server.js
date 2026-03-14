import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

const otpStore = new Map();
const OTP_EXPIRE_MS = 5 * 60 * 1000;

// In-memory stores for admin (reset on server restart)
const users = [];
let nextPlantId = 1;
const plants = [
  {
    id: nextPlantId++,
    name: "Mango Tree",
    scientificName: "Mangifera indica",
    location: "Orchard Section 1",
    coordinates: "16.9839498, 73.3123325",
    dateAdded: "2026-03-05",
    status: "Active",
    scans: 0,
  },
  {
    id: nextPlantId++,
    name: "Almond Tree",
    scientificName: "Prunus dulcis",
    location: "Orchard Section 2",
    coordinates: "16.9839450, 73.3124398",
    dateAdded: "2026-03-05",
    status: "Active",
    scans: 0,
  },
  {
    id: nextPlantId++,
    name: "Gulmohar Tree",
    scientificName: "Delonix regia",
    location: "Avenue / Roadside Plantation",
    coordinates: "16.9839411, 73.3125585",
    dateAdded: "2026-03-05",
    status: "Active",
    scans: 0,
  },
];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhone(phone) {
  return String(phone).replace(/\D/g, "");
}

// Administrator accounts (email + password)
const ADMIN_ACCOUNTS = [
  {
    email: "owaiszaid2007@gmail.com",
    password: "Owais@2007",
    name: "Admin User",
    phone: "7249711548",
  },
  // You can add more admin accounts here if needed
];

async function sendOTPViaFast2SMS(phoneNumber, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return { demo: true, otp };

  const numbers = cleanPhone(phoneNumber);
  if (numbers.length !== 10) throw new Error("Indian mobile number must be 10 digits");

  const url = "https://www.fast2sms.com/dev/bulkV2";
  try {
    const res = await axios.get(url, {
      params: {
        authorization: apiKey,
        route: "otp",
        variables_values: otp,
        numbers: numbers,
      },
    });
    if (res.data && res.data.return === true) return { sent: true };
    throw new Error(res.data?.message || "Fast2SMS failed");
  } catch (err) {
    console.error("Fast2SMS error:", err.response?.data || err.message);
    throw err;
  }
}

app.post("/api/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    const phone = cleanPhone(phoneNumber || "");
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: "Please enter a valid phone number (at least 10 digits)." });
    }

    const otp = generateOTP();
    otpStore.set(phone, { otp, expires: Date.now() + OTP_EXPIRE_MS });

    const result = await sendOTPViaFast2SMS(phone, otp).catch(() => ({ demo: true, otp }));

    if (result.demo) {
      return res.json({
        message: "OTP generated (demo mode – no SMS sent).",
        demoMode: true,
        demoOTP: result.otp,
      });
    }
    res.json({ message: "OTP sent successfully to your number." });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({
      error: err.message || "Failed to send OTP. Try again or use demo mode.",
    });
  }
});

// Admin login with email + password (no OTP)
app.post("/api/login-admin", (req, res) => {
  try {
    const { email, password } = req.body || {};
    const e = String(email || "").trim().toLowerCase();
    const p = String(password || "");

    if (!e || !p) {
      return res.status(400).json({ error: "Please enter email and password." });
    }

    const admin = ADMIN_ACCOUNTS.find(
      (a) =>
        a.email.trim().toLowerCase() === e &&
        a.password === p
    );

    if (!admin) {
      return res.status(401).json({ error: "Invalid admin email or password." });
    }

    let existing = users.find(
      (u) =>
        String(u.email || "").trim().toLowerCase() === e &&
        u.role === "Administrator"
    );
    const now = new Date().toISOString();
    if (!existing) {
      existing = {
        name: admin.name || "Administrator",
        email: admin.email,
        phone: cleanPhone(admin.phone || ""),
        role: "Administrator",
        lastLogin: now,
      };
      users.push(existing);
    } else {
      existing.lastLogin = now;
    }

    res.json({
      success: true,
      message: "Admin login successful.",
      admin: {
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        role: existing.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Admin login failed. Please try again." });
  }
});

// ---------- Admin: Users (credential checking) ----------
app.get("/api/users", (req, res) => {
  try {
    const safeUsers = users
      .slice()
      .reverse()
      .map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to load users." });
  }
});

function findUserByEmailOrPhone(email, phone) {
  const e = String(email || "").trim().toLowerCase();
  const p = cleanPhone(phone || "");
  return users.find((u) => {
    const ue = String(u.email || "").trim().toLowerCase();
    const up = cleanPhone(u.phone || "");
    return (e && ue === e) || (p && up === p);
  });
}

// ---------- Admin: Update user credentials ----------
app.put("/api/users", (req, res) => {
  try {
    const { originalEmail, originalPhone, name, email, phone, role } = req.body || {};

    if (!originalEmail && !originalPhone) {
      return res.status(400).json({ error: "Missing original email or phone to identify the user." });
    }

    const user = findUserByEmailOrPhone(originalEmail, originalPhone);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName) user.name = trimmedName;
    }
    if (typeof email === "string") {
      user.email = String(email || "").trim();
    }
    if (typeof phone === "string") {
      user.phone = cleanPhone(phone || "");
    }
    if (typeof role === "string" && role.trim()) {
      user.role = role.trim();
    }

    const { password: _pw, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// ---------- User sign up & password sign in ----------
app.post("/api/signup", (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    const cleanPhoneNumber = cleanPhone(phone || "");
    const trimmedEmail = String(email || "").trim();
    const trimmedName = String(name || "").trim() || "User";
    const pwd = String(password || "");

    if (!trimmedEmail && !cleanPhoneNumber) {
      return res.status(400).json({ error: "Please provide at least an email or phone number." });
    }
    if (!pwd || pwd.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    let existing = findUserByEmailOrPhone(trimmedEmail, cleanPhoneNumber);
    if (existing && existing.role === "Administrator") {
      return res.status(400).json({ error: "This account is registered as Administrator. Please sign in as Administrator." });
    }

    const now = new Date().toISOString();
    if (!existing) {
      existing = {
        name: trimmedName,
        email: trimmedEmail,
        phone: cleanPhoneNumber,
        role: "User",
        lastLogin: now,
      };
      users.push(existing);
    }

    existing.name = trimmedName;
    existing.email = trimmedEmail;
    existing.phone = cleanPhoneNumber;
    existing.role = "User";
    existing.lastLogin = now;
    existing.password = pwd; // NOTE: stored in plain text for demo only

    const { password: _pw, ...safeUser } = existing;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up. Please try again." });
  }
});

app.post("/api/login-user", (req, res) => {
  try {
    const { emailOrPhone, password } = req.body || {};
    const value = String(emailOrPhone || "");
    const pwd = String(password || "");

    if (!value || !pwd) {
      return res.status(400).json({ error: "Please enter your email/phone and password." });
    }

    const byEmail = value.includes("@");
    const user = byEmail
      ? findUserByEmailOrPhone(value, null)
      : findUserByEmailOrPhone(null, value);

    if (!user || user.role === "Administrator") {
      return res.status(400).json({ error: "User account not found. Please sign up first." });
    }
    if (!user.password || user.password !== pwd) {
      return res.status(400).json({ error: "Invalid password. Please try again." });
    }

    user.lastLogin = new Date().toISOString();
    user.role = "User";

    const { password: _pw, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ error: "Failed to sign in. Please try again." });
  }
});

// ---------- Admin: Plants (add / edit / remove trees) ----------
app.get("/api/plants", (req, res) => {
  try {
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: "Failed to load plants." });
  }
});

app.get("/api/plants/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const plant = plants.find((p) => p.id === id);
    if (!plant) return res.status(404).json({ error: "Plant not found." });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: "Failed to load plant." });
  }
});

app.post("/api/plants", (req, res) => {
  try {
    const { name, scientificName, location, coordinates, height, diameter, age, description, careInfo } = req.body || {};
    if (!name || !location) {
      return res.status(400).json({ error: "Plant name and location are required." });
    }
    const id = nextPlantId++;
    const plant = {
      id,
      name: name.trim(),
      scientificName: (scientificName || "").trim(),
      location: (location || "").trim(),
      coordinates: (coordinates || "").trim(),
      height: (height || "").trim(),
      diameter: (diameter || "").trim(),
      age: (age || "").trim(),
      description: (description || "").trim(),
      careInfo: (careInfo || "").trim(),
      dateAdded: new Date().toISOString().slice(0, 10),
      status: "Active",
      scans: 0,
    };
    plants.push(plant);
    res.status(201).json(plant);
  } catch (err) {
    console.error("Add plant error:", err);
    res.status(500).json({ error: "Failed to add plant." });
  }
});

app.delete("/api/plants/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = plants.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Plant not found." });
    plants.splice(idx, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove plant." });
  }
});

app.put("/api/plants/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const plant = plants.find((p) => p.id === id);
    if (!plant) return res.status(404).json({ error: "Plant not found." });

    const allowed = [
      "name",
      "scientificName",
      "location",
      "coordinates",
      "height",
      "diameter",
      "age",
      "description",
      "careInfo",
      "status",
      "scans",
    ];

    const body = req.body || {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] != null) {
        if (key === "scans") {
          plant[key] = Number(body[key]) || 0;
        } else {
          plant[key] = String(body[key]).trim();
        }
      }
    });

    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: "Failed to update plant." });
  }
});

// ---------- User: Feedback, reports, contact (stored in memory) ----------
let nextMessageId = 1;
const feedbackList = [];
const reportList = [];
const contactList = [];

app.post("/api/feedback", (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Please enter your feedback." });
    }
    const msg = {
      id: nextMessageId++,
      type: "feedback",
      name: (name || "").trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      message: String(message).trim(),
      at: new Date().toISOString(),
      adminReply: null,
      repliedAt: null,
    };
    feedbackList.push(msg);
    res.json({ success: true, message: "Thank you for your feedback." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit feedback." });
  }
});

app.post("/api/reports", (req, res) => {
  try {
    const { name, subject, problemType, message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Please describe the problem." });
    }
    const msg = {
      id: nextMessageId++,
      type: "report",
      name: (name || "").trim(),
      subject: (subject || "").trim(),
      problemType: (problemType || "").trim(),
      message: String(message).trim(),
      at: new Date().toISOString(),
      adminReply: null,
      repliedAt: null,
    };
    reportList.push(msg);
    res.json({ success: true, message: "Your report has been submitted. We will look into it." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report." });
  }
});

app.post("/api/contact", (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Please enter your message." });
    }
    const msg = {
      id: nextMessageId++,
      type: "contact",
      name: (name || "").trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      message: String(message).trim(),
      at: new Date().toISOString(),
      adminReply: null,
      repliedAt: null,
    };
    contactList.push(msg);
    res.json({ success: true, message: "Your message has been sent. We will get back to you." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message." });
  }
});

// ---------- Admin: Get all messages ----------
app.get("/api/messages", (req, res) => {
  try {
    const allMessages = [
      ...feedbackList.map(m => ({ ...m, type: "feedback" })),
      ...reportList.map(m => ({ ...m, type: "report" })),
      ...contactList.map(m => ({ ...m, type: "contact" })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at));
    res.json(allMessages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// ---------- Admin: Send reply to user ----------
app.post("/api/messages/:id/reply", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reply } = req.body || {};
    if (!reply || !String(reply).trim()) {
      return res.status(400).json({ error: "Please enter a reply message." });
    }

    let found = false;
    const replyText = String(reply).trim();
    const replyAt = new Date().toISOString();

    // Find and update in feedbackList
    const fbIdx = feedbackList.findIndex(m => m.id === id);
    if (fbIdx !== -1) {
      feedbackList[fbIdx].adminReply = replyText;
      feedbackList[fbIdx].repliedAt = replyAt;
      found = true;
    }

    // Find and update in reportList
    if (!found) {
      const repIdx = reportList.findIndex(m => m.id === id);
      if (repIdx !== -1) {
        reportList[repIdx].adminReply = replyText;
        reportList[repIdx].repliedAt = replyAt;
        found = true;
      }
    }

    // Find and update in contactList
    if (!found) {
      const conIdx = contactList.findIndex(m => m.id === id);
      if (conIdx !== -1) {
        contactList[conIdx].adminReply = replyText;
        contactList[conIdx].repliedAt = replyAt;
        found = true;
      }
    }

    if (!found) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ success: true, message: "Reply sent successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send reply." });
  }
});

// ---------- User: Get their messages with replies ----------
app.get("/api/my-messages", (req, res) => {
  try {
    const { email, phone, type } = req.query || {};
    const allMessages = [
      ...feedbackList.map(m => ({ ...m, type: "feedback" })),
      ...reportList.map(m => ({ ...m, type: "report" })),
      ...contactList.map(m => ({ ...m, type: "contact" })),
    ];
    
    // Filter by type if provided
    let filtered = allMessages;
    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }
    
    // Filter by email or phone if provided
    if (email) {
      filtered = filtered.filter(m => m.email && m.email.toLowerCase() === email.toLowerCase());
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      filtered = filtered.filter(m => {
        const msgPhone = String(m.phone || "").replace(/\D/g, "");
        return msgPhone === cleanPhone;
      });
    }
    
    res.json(filtered.sort((a, b) => new Date(b.at) - new Date(a.at)));
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (!process.env.FAST2SMS_API_KEY) {
    console.log("Demo mode: No FAST2SMS_API_KEY – OTP will be returned in API response (no SMS).");
  }
});
