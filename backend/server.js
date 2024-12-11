//server.js ----------------------------10.12.2024---corrected
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Database connection
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
const stockRoutes = require("./routes/stockRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const messageRoutes = require("./routes/messageRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // Enable CORS for allowed origins
app.use(express.json()); // Parse incoming JSON request bodies
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // Log HTTP requests

// Seed admin user if it doesn't exist
const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new User({
        firstName: "Admin",
        lastName: "User",
        email: process.env.ADMIN_EMAIL,
        phone: "0000000000",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  }
};

// Run the seed function to ensure admin exists
seedAdminUser();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running successfully" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`Global Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// 404 Error Handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API route not found",
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
