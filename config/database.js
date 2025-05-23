const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "casting_platform",
  port: process.env.DB_PORT || 3306, 

});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err.message);
    process.exit(1); // Exit the application if DB connection fails
  }
  console.log("✅ Connected to MySQL database.");
  connection.release(); // Release the connection back to the pool
});

// Export the pool for direct usage
module.exports = pool.promise(); // Enables promise-based usage
