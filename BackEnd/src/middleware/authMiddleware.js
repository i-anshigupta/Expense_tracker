import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes
 * Checks for JWT token and verifies user
 */
export const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user (without password) to request
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    status: "error",
                    message: "User not found",
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                status: "error",
                message: "Not authorized, token failed",
            });
        }
    }

    // If no token
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Not authorized, no token",
        });
    }
};
