const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../config/database");

// -------------------- Register a New User or Production Company --------------------
const registerProduction = async (req, res) => {
  try {
    const { full_name, company_name, city, type_of_work, email, phone_number, password } = req.body;

    // Validate required fields
    if (!full_name || !company_name || !city || !type_of_work || !email || !phone_number || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS production_companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        type_of_work VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Check if email or phone number already exists
    const [existingRecord] = await pool.query(
      `SELECT * FROM production_companies WHERE email = ? OR phone_number = ?`,
      [email, phone_number]
    );

    if (existingRecord.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A record with this email or phone number already exists.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert into database
    const sql = `
      INSERT INTO production_companies (
        full_name, company_name, city, type_of_work, email, phone_number, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [full_name, company_name, city, type_of_work, email, phone_number, hashedPassword];
    const [result] = await pool.query(sql, values);

    res.status(201).json({
      success: true,
      message: "Production registered successfully",
      productionId: result.insertId,
    });
  } catch (error) {
    console.error("Error registering production:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- Login a User or Production Company --------------------
const loginProduction = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if the user exists
    const [userRecord] = await pool.query(
      `SELECT * FROM production_companies WHERE email = ?`,
      [email]
    );

    if (userRecord.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userRecord[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        company_name: user.company_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -------------------- Add Job Post --------------------
const addJobPost = async (req, res) => {
  try {
    const {
      project_type,
      shooting_location,
      project_description,
      audition_type,
      language_required,
      audition_dates,
      shoot_dates,
      role_title,
      shoot_duration,
      gender,
      application_deadline,
      age_range,
      availability_required,
      height,
      body_type,
      payment_type,
      skills_needed,
      additional_perks,
      role_description,
    } = req.body;

    const { id: userId, full_name: postedBy } = req.user;

    // Validate required fields
    if (!project_type || !shooting_location || !role_title || !gender || !application_deadline) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        project_type VARCHAR(100) NOT NULL,
        shooting_location VARCHAR(255) NOT NULL,
        project_description TEXT DEFAULT NULL,
        audition_type VARCHAR(100) DEFAULT NULL,
        language_required VARCHAR(100) DEFAULT NULL,
        audition_dates DATE DEFAULT NULL,
        shoot_dates DATE DEFAULT NULL,
        role_title VARCHAR(100) NOT NULL,
        shoot_duration VARCHAR(50) DEFAULT NULL,
        gender VARCHAR(50) NOT NULL,
        application_deadline DATE NOT NULL,
        age_range VARCHAR(50) DEFAULT NULL,
        availability_required VARCHAR(50) DEFAULT NULL,
        height VARCHAR(50) DEFAULT NULL,
        body_type VARCHAR(50) DEFAULT NULL,
        payment_type VARCHAR(50) DEFAULT NULL,
        skills_needed TEXT DEFAULT NULL,
        additional_perks TEXT DEFAULT NULL,
        role_description TEXT DEFAULT NULL,
        posted_by VARCHAR(255) DEFAULT NULL,
        posted_by_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES production_companies(id) ON DELETE CASCADE
      )
    `);

    // Insert job post into database
    const sql = `
      INSERT INTO job_posts (
        user_id, project_type, shooting_location, project_description,
        audition_type, language_required, audition_dates, shoot_dates,
        role_title, shoot_duration, gender, application_deadline, age_range,
        availability_required, height, body_type, payment_type,
        skills_needed, additional_perks, role_description, posted_by, posted_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userId,
      project_type,
      shooting_location,
      project_description || null,
      audition_type || null,
      language_required || null,
      audition_dates || null,
      shoot_dates || null,
      role_title,
      shoot_duration || null,
      gender,
      application_deadline,
      age_range || null,
      availability_required || null,
      height || null,
      body_type || null,
      payment_type || null,
      skills_needed || null,
      additional_perks || null,
      role_description || null,
      postedBy,
      userId,
    ];

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      success: true,
      message: "Job post created successfully",
      jobPostId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding job post:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerProduction,
  loginProduction,
  addJobPost,
};
