require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/database"); // ✅ DB connection auto-tested
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const productionRouter = require("./routes/productionRoutes");
const homeRouter = require("./routes/homeRoutes");

const app = express();

/* ---------- Core Middleware ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Serve Static Files ---------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------- API Routes ---------- */
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/production", productionRouter);
app.use("/api/home", homeRouter);

/* ---------- Root Route ---------- */
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the API!" });
});

/* ---------- 404 Not Found Handler ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested URL was not found on this server",
  });
});

/* ---------- Start Server ---------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
