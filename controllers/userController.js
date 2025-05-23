const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require('../config/database');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        // Input validation
        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }

        // Create users table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL UNIQUE,
                plan ENUM('free', 'premium') DEFAULT 'free',
                suspended BOOLEAN DEFAULT FALSE,
                blocked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if user exists
        const [existingUser] = await pool.query(
            "SELECT id FROM users WHERE email = ? OR mobile = ?", 
            [email, mobile]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: "User with this email or mobile already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert new user
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, mobile) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, mobile]
        );

        return res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            userId: result.insertId 
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check if user exists
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        // Check account status
        if (user.suspended) {
            return res.status(403).json({
                success: false,
                message: "Account suspended. Please contact support."
            });
        }

        if (user.blocked) {
            return res.status(403).json({
                success: false,
                message: "Account blocked. Please contact support."
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        // User data without sensitive information
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            plan: user.plan
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const getUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: "User not authorized" 
            });
        }

        const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Return only non-sensitive data
        const userProfile = {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            mobile: user[0].mobile,
            plan: user[0].plan,
            created_at: user[0].created_at
        };

        return res.status(200).json({ 
            success: true,
            user: userProfile 
        });

    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const createTicket = async (req, res) => {
    try {
        const { email, mobile_no, title, description } = req.body;

        // Input validation
        if (!email || !mobile_no || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Email, mobile number, title, and description are required",
            });
        }

        // Create `tickets` table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                mobile_no VARCHAR(20) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createTableQuery);

        // Insert ticket into the database
        const insertQuery = `
            INSERT INTO tickets (email, mobile_no, title, description) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(insertQuery, [email, mobile_no, title, description]);

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticketId: result.insertId, // Return the ID of the newly created ticket
        });
    } catch (error) {
        console.error("Error creating ticket:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};



module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    createTicket
};