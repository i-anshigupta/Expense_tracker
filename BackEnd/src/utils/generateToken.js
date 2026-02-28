import jwt from "jsonwebtoken";

/**
 * Generates a JWT token for authenticated users
 * @param {string} userId - MongoDB User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d", // token validity
        }
    );
};

export default generateToken;
