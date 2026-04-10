require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");
const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// ---------------- JWT Middleware ----------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"]; // expects: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // { userId: ... }
    next();
  });
}

// ---------------- Express App ----------------
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
}));

// ---------------- MongoDB Connection ----------------
const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log(" MongoDB Connected to Atlas"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// ---------------- Signup ----------------
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Login ----------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, address: user.address },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Profile (Protected) ----------------
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Home (Geocoding user's address) ----------------
app.get("/api/home", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("address name");
    if (!user) return res.status(404).json({ error: "User not found" });

    const apiKey = process.env.OPENCAGE_API_KEY;
    const geoURL = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      user.address
    )}&key=${apiKey}&limit=1`;

    const response = await axios.get(geoURL);

    if (!response.data.results || response.data.results.length === 0) {
      return res
        .status(404)
        .json({ error: "Could not find location for this address" });
    }

    const { lat, lng } = response.data.results[0].geometry;
    const formatted = response.data.results[0].formatted;

    res.json({
      success: true,
      message: "Home data fetched successfully",
      user: { name: user.name, address: user.address },
      location: {
        latitude: lat,
        longitude: lng,
        formattedAddress: formatted,
      },
    });
  } catch (error) {
    console.error("Error in /api/home:", error.message);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching home data" });
  }
});

// ---------------- Expanded Blood/Health Camps Data ----------------
const camps = [
  // Central Kolkata
  { id: 1, name: "Esplanade Blood Donation Center", type: "Blood Camp", latitude: 22.5665, longitude: 88.3540, address: "Esplanade, Central Kolkata" },
  { id: 2, name: "Park Street Health Camp", type: "Health Camp", latitude: 22.5530, longitude: 88.3625, address: "Park Street, Kolkata" },
  { id: 3, name: "Dharmatala Blood Bank", type: "Blood Camp", latitude: 22.5629, longitude: 88.3523, address: "Dharmatala, Kolkata" },
  
  // North Kolkata
  { id: 4, name: "Shyama Charan Blood Center", type: "Blood Camp", latitude: 22.5963, longitude: 88.3795, address: "Shyama Charan Street, North Kolkata" },
  { id: 5, name: "Bagbazar Health Clinic", type: "Health Camp", latitude: 22.5924, longitude: 88.3722, address: "Bagbazar, North Kolkata" },
  { id: 6, name: "Hatibagan Medical Camp", type: "Health Camp", latitude: 22.5985, longitude: 88.3665, address: "Hatibagan, North Kolkata" },
  { id: 7, name: "Dum Dum Blood Drive", type: "Blood Camp", latitude: 22.6270, longitude: 88.4220, address: "Dum Dum, North Kolkata" },
  { id: 8, name: "Barrackpore Health Center", type: "Health Camp", latitude: 22.7604, longitude: 88.3733, address: "Barrackpore, North 24 Parganas" },
  
  // South Kolkata
  { id: 9, name: "Park Circus Health Checkup", type: "Health Camp", latitude: 22.5410, longitude: 88.3630, address: "Park Circus, South Kolkata" },
  { id: 10, name: "Kalighat Blood Donation", type: "Blood Camp", latitude: 22.5251, longitude: 88.3467, address: "Kalighat, South Kolkata" },
  { id: 11, name: "Tollygunge Medical Center", type: "Health Camp", latitude: 22.5010, longitude: 88.3460, address: "Tollygunge, South Kolkata" },
  { id: 12, name: "Garia Blood Bank", type: "Blood Camp", latitude: 22.4656, longitude: 88.3955, address: "Garia, South Kolkata" },
  { id: 13, name: "Jadavpur Health Camp", type: "Health Camp", latitude: 22.4998, longitude: 88.3712, address: "Jadavpur, South Kolkata" },
  { id: 14, name: "Behala Community Health", type: "Health Camp", latitude: 22.4986, longitude: 88.3016, address: "Behala, South Kolkata" },
  
  // East Kolkata
  { id: 15, name: "Salt Lake Blood Center", type: "Blood Camp", latitude: 22.5735, longitude: 88.4332, address: "Salt Lake Sector V, East Kolkata" },
  { id: 16, name: "Rajarhat Health Hub", type: "Health Camp", latitude: 22.5937, longitude: 88.4582, address: "Rajarhat, East Kolkata" },
  { id: 17, name: "Ultadanga Blood Drive", type: "Blood Camp", latitude: 22.6018, longitude: 88.4002, address: "Ultadanga, East Kolkata" },
  { id: 18, name: "New Town Medical Camp", type: "Health Camp", latitude: 22.6108, longitude: 88.4695, address: "New Town, East Kolkata" },
  { id: 19, name: "Lake Town Health Center", type: "Health Camp", latitude: 22.5851, longitude: 88.4144, address: "Lake Town, East Kolkata" },
  
  // West Kolkata
  { id: 20, name: "Howrah Blood Bank", type: "Blood Camp", latitude: 22.5958, longitude: 88.2636, address: "Howrah Station, West Bengal" },
  { id: 21, name: "Shibpur Health Camp", type: "Health Camp", latitude: 22.5675, longitude: 88.3104, address: "Shibpur, Howrah" },
  { id: 22, name: "Liluah Medical Center", type: "Health Camp", latitude: 22.6332, longitude: 88.3489, address: "Liluah, Howrah" },
  { id: 23, name: "Santragachi Blood Drive", type: "Blood Camp", latitude: 22.6185, longitude: 88.2320, address: "Santragachi, Howrah" },
  
  // Outer areas
  { id: 24, name: "Barasat Blood Center", type: "Blood Camp", latitude: 22.7260, longitude: 88.4810, address: "Barasat, North 24 Parganas" },
  { id: 25, name: "Diamond Harbour Health", type: "Health Camp", latitude: 22.1893, longitude: 88.1875, address: "Diamond Harbour, South 24 Parganas" },
  { id: 26, name: "Burdwan Medical Camp", type: "Health Camp", latitude: 23.2324, longitude: 87.8615, address: "Burdwan, West Bengal" },
  { id: 27, name: "Durgapur Blood Bank", type: "Blood Camp", latitude: 23.5204, longitude: 87.3119, address: "Durgapur, West Bengal" },
  { id: 28, name: "Siliguri Health Center", type: "Health Camp", latitude: 26.7271, longitude: 88.3953, address: "Siliguri, West Bengal" },
  { id: 29, name: "Asansol Medical Hub", type: "Health Camp", latitude: 23.6939, longitude: 86.9524, address: "Asansol, West Bengal" },
  { id: 30, name: "Kharagpur Blood Drive", type: "Blood Camp", latitude: 22.3460, longitude: 87.2320, address: "Kharagpur, West Bengal" }
];

// ---------------- Distance Function ----------------
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------- Nearest Camps API ----------------
app.get("/api/nearest-camps", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("address");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get geocoded location of user
    const apiKey = process.env.OPENCAGE_API_KEY;
    const geoURL = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      user.address
    )}&key=${apiKey}&limit=1`;

    const response = await axios.get(geoURL);
    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "Could not find location for user" });
    }

    const { lat, lng } = response.data.results[0].geometry;
    const userFormattedAddress = response.data.results[0].formatted;

    // Calculate distances
    const campsWithDistance = camps.map(camp => ({
      ...camp,
      distance: getDistance(lat, lng, camp.latitude, camp.longitude)
    }));

    // Sort and pick nearest 3
    const nearestCamps = campsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);

    res.json({
      success: true,
      message: "Nearest camps fetched successfully",
      userLocation: { 
        latitude: lat, 
        longitude: lng,
        formattedAddress: userFormattedAddress 
      },
      camps: nearestCamps
    });
  } catch (error) {
    console.error("Error in /api/nearest-camps:", error.message);
    res.status(500).json({ error: "Something went wrong while fetching camps" });
  }
});

// ---------------- SOS Emergency Report (No Auth Required) ----------------
app.post("/api/sos", async (req, res) => {
  try {
    const { name, phone, location, emergency, description } = req.body;
    
    // Validate required fields
    if (!name || !phone || !location || !emergency) {
      return res.status(400).json({ 
        error: "Name, phone, location, and emergency type are required" 
      });
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send notifications to healthcare workers
    // 3. Integrate with emergency services
    // 4. Send SMS/email alerts
    
    console.log("🚨 EMERGENCY SOS REPORT RECEIVED:", {
      name,
      phone,
      location,
      emergency,
      description,
      timestamp: new Date().toISOString()
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: "Emergency report submitted successfully",
      emergencyId: `SOS-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in /api/sos:", error.message);
    res.status(500).json({ 
      error: "Failed to submit emergency report. Please try again or call 108 immediately." 
    });
  }
});

// ---------------- Start Server ----------------
app.listen(5000, () => {
  console.log(" Server running on http://localhost:5000");
});