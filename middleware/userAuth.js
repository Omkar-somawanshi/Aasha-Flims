const jwt = require("jsonwebtoken");
const pool = require("../config/database"); // Your pool connection

const userAuth = async (req, res, next) => {
    try {
        // 1. Check if Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false,
                message: "Authorization token required" 
            });
        }

        // 2. Extract and verify token
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Verify user exists in database
        const [user] = await pool.query(
            "SELECT id, email, suspended, blocked FROM users WHERE id = ?", 
            [decoded.userId]
        );

        if (!user || user.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: "User account not found" 
            });
        }

        // 4. Check account status
        if (user[0].suspended) {
            return res.status(403).json({
                success: false,
                message: "Account suspended. Please contact support."
            });
        }

        if (user[0].blocked) {
            return res.status(403).json({
                success: false,
                message: "Account blocked. Please contact support."
            });
        }

        // 5. Attach user to request
        req.user = {
            id: user[0].id,
            email: user[0].email
            // Add other non-sensitive fields as needed
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again." 
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }

        // Generic error response
        res.status(500).json({ 
            success: false,
            message: "Authentication failed",
            error: error.message 
        });
    }
};






module.exports = userAuth;