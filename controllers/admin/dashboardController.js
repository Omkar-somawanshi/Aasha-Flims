
const pool = require("../../config/database")

const fetchTickets = async (req, res) => {
    try {
        // Fetch tickets from the database
        const fetchQuery = `SELECT * FROM tickets`;
        const [tickets] = await pool.query(fetchQuery);

        return res.status(200).json({
            success: true,
            message: "Tickets fetched successfully",
            data: tickets,
        });
    } catch (error) {
        console.error("Error fetching tickets:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


const allUsers = async (req, res) => {
    try {
        // Fetch tickets from the database
        const fetchQuery = `SELECT * FROM users`;
        const [users] = await pool.query(fetchQuery);

        return res.status(200).json({
            success: true,
            message: "Tickets fetched successfully",
            data: users,
        });
    } catch (error) {
        console.error("Error fetching tickets:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    fetchTickets,
    allUsers
};