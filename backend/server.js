const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");

// JWT auth middleware (paste right after the imports)
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"]; // expects: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, "mysecretkey", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // { userId: ... }
    next();
  });
}

const app = express();
app.use(express.json());
app.use(cors());

//  MongoDB Connection
const mongoURI = "mongodb+srv://admin:282501@cluster0.11huinz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI)
  .then(() => console.log(" MongoDB Connected to Atlas"))
  .catch((err) => console.error(" MongoDB connection error:", err));


//  Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
    });

    await newUser.save();

    // create JWT
    const token = jwt.sign({ userId: newUser._id }, "mysecretkey", {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { name: newUser.name, email: newUser.email, address: newUser.address },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // create token
    const token = jwt.sign({ userId: user._id }, "mysecretkey", {
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
// Protected route: get current user's profile
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//  Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
