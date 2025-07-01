require("dotenv").config();
const express = require("express");
const cors = require("cors");
const testConnection = require("./config/database");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const multer = require("multer");
const productionRouter = require("./routes/productionRoutes");
// Test DB connection on startup
testConnection;

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/production", productionRouter);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to the API!" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "The requested URL was not found on this server",
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
