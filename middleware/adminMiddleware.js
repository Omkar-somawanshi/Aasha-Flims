const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        // 1. Get the authorization header
        const authHeader = req.headers.authorization;

        // 2. Check if the header exists and starts with "Bearer"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false,
                message: "Authorization token required" 
            });
        }

        // 3. Extract the token from the header
        const token = authHeader.split(" ")[1];

        // 4. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attach the decoded user information to the `req` object
        req.user = decoded;

        // 6. Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);

        // Handle specific errors
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        // Catch-all for other errors
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = authenticate;
