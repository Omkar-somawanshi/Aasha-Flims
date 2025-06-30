const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");


// -------------------- REGISTER USER --------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Input validation
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Ensure the users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        plan ENUM('free', 'premium') DEFAULT 'free',
        suspended BOOLEAN DEFAULT FALSE,
        suspended_from DATETIME NULL,
        suspended_to DATETIME NULL,
        blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        gender VARCHAR(50) NULL,
        weight VARCHAR(50) NULL,
        facebook_link VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        hair_color VARCHAR(50) NULL,
        state VARCHAR(100) NULL,
        available_from DATE NULL,
        body_type VARCHAR(50) NULL,
        willing_to_travel BOOLEAN NULL,
        skin_tone VARCHAR(50) NULL,
        preferred_locations TEXT NULL,
        profile_photo MEDIUMTEXT NULL,
        languages_known TEXT NULL,
        past_projects TEXT NULL,
        headshot_photo MEDIUMTEXT NULL,
        dialects_accents TEXT NULL,
        special_appearances_or_training TEXT NULL,
        full_body_photo MEDIUMTEXT NULL,
        skills TEXT NULL,
        intro_video LONGTEXT NULL
      )
    `);

    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR mobile = ?",
      [email, mobile]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email or mobile already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user into the database
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, mobile) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, mobile]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- LOGIN USER --------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    // Check account status
    if (user.blocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked. Please contact support.",
      });
    }

    if (user.suspended) {
      const now = new Date();
      if (user.suspended_to && new Date(user.suspended_to) < now) {
        // Auto-unsuspend
        await pool.query(
          "UPDATE users SET suspended = FALSE, suspended_from = NULL, suspended_to = NULL WHERE id = ?",
          [user.id]
        );
      } else {
        let message = "Account suspended. Please contact support.";
        if (user.suspended_to) {
          message += ` Suspension ends on: ${user.suspended_to.toLocaleString()}`;
        }
        return res.status(403).json({ success: false, message });
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    // Response with user data and token
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      plan: user.plan,
      suspended: user.suspended,
      suspended_to: user.suspended_to,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- GET USER PROFILE --------------------
const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userProfile = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      mobile: user[0].mobile,
      plan: user[0].plan,
      suspended: user[0].suspended,
      suspended_to: user[0].suspended_to,
      created_at: user[0].created_at,
    };

    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- CREATE TICKET --------------------
const createTicket = async (req, res) => {
  try {
    const { email, mobile_no, title, description } = req.body;

    if (!email || !mobile_no || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [result] = await pool.query(
      "INSERT INTO tickets (email, mobile_no, title, description) VALUES (?, ?, ?, ?)",
      [email, mobile_no, title, description]
    );

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- UPDATE PROFILE --------------------
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
console.log("Request body:", req.body);

    // Destructure form data
    const {
      gender,
      weight,
      facebook_link,
      city,
      hair_color,
      state,
      available_from,
      body_type,
      willing_to_travel,
      skin_tone,
      preferred_locations,
      languages_known,
      past_projects,
      dialects_accents,
      special_appearances_or_training,
      skills,
    } = req.body;

    // File uploads (from Multer)
    const profilePhotoFile = req.files?.profile_photo?.[0];
    const headshotPhotoFile = req.files?.headshot_photo?.[0];
    const fullBodyPhotoFile = req.files?.full_body_photo?.[0];
    const introVideoFile = req.files?.intro_video?.[0];

    // Convert uploaded files to Base64
    const encodeBase64 = (buffer) => (buffer ? buffer.toString("base64") : null);

    const profilePhoto = profilePhotoFile
      ? encodeBase64(profilePhotoFile.buffer)
      : null;
    const headshotPhoto = headshotPhotoFile
      ? encodeBase64(headshotPhotoFile.buffer)
      : null;
    const fullBodyPhoto = fullBodyPhotoFile
      ? encodeBase64(fullBodyPhotoFile.buffer)
      : null;
    const introVideo = introVideoFile
      ? encodeBase64(introVideoFile.buffer)
      : null;

    // SQL Query
    const sql = `
      UPDATE users 
      SET 
        gender = ?, 
        weight = ?, 
        facebook_link = ?, 
        city = ?, 
        hair_color = ?, 
        state = ?, 
        available_from = ?, 
        body_type = ?, 
        willing_to_travel = ?, 
        skin_tone = ?, 
        preferred_locations = ?, 
        profile_photo = ?, 
        languages_known = ?, 
        past_projects = ?, 
        headshot_photo = ?, 
        dialects_accents = ?, 
        special_appearances_or_training = ?, 
        full_body_photo = ?, 
        skills = ?, 
        intro_video = ?, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    const values = [
      gender || null,
      weight || null,
      facebook_link || null,
      city || null,
      hair_color || null,
      state || null,
      available_from || null,
      body_type || null,
      willing_to_travel !== undefined ? willing_to_travel : null,
      skin_tone || null,
      preferred_locations || null,
      profilePhoto,
      languages_known || null,
      past_projects || null,
      headshotPhoto,
      dialects_accents || null,
      special_appearances_or_training || null,
      fullBodyPhoto,
      skills || null,
      introVideo,
      userId,
    ];

    // Execute the query
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no changes detected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- EXPORT MODULES --------------------
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  createTicket,
  updateProfile,
};
