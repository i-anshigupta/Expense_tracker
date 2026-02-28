import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import { runRecurringExecutor } from "../utils/recurringExecutor.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please provide name, email and password",
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                status: "error",
                message: "User with this email already exists",
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password, // will be hashed by pre-save hook
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatarColor: user.avatarColor,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while registering user",
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
        }

        await runRecurringExecutor(user._id);

        const token = generateToken(user._id);

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatarColor: user.avatarColor,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while logging in",
        });
    }
};


/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
    try {
        // `req.user` will come from auth middleware
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("GetMe error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching user profile",
        });
    }
};

/**
 * @desc    Update current user's profile (name, avatarColor)
 * @route   PUT /api/auth/me
 * @access  Private
 * body: { name?, avatarColor? }
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, avatarColor } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        if (name !== undefined) user.name = String(name).trim();
        if (avatarColor !== undefined) user.avatarColor = String(avatarColor).trim();

        await user.save();

        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarColor: user.avatarColor,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            status: "success",
            data: { user: updatedUser },
        });
    } catch (error) {
        console.error("UpdateProfile error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while updating profile",
        });
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 * body: { currentPassword, newPassword }
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: "error",
                message: "Both current and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: "error",
                message: "New password must be at least 6 characters",
            });
        }

        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Current password is incorrect",
            });
        }

        // Hashing is handled by pre-save hook
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("ChangePassword error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while changing password",
        });
    }
};