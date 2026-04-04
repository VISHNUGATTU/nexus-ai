import Admin from "../models/Admin.js";
import User from "../models/User.js"; // Needed so the admin can manage users
import generateToken from "../utils/generateToken.js";

// @desc    Register a new admin (You might want to secure this route later!)
// @route   POST /api/admin/register
export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both username and password" 
      });
    }

    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Admin already exists" 
      });
    }

    const admin = await Admin.create({ username, password });

    if (admin) {
      generateToken(res, admin._id);

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        admin: {
          _id: admin._id,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid admin data" });
    }
  } catch (error) {
    console.error("❌ Admin Register Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both username and password" 
      });
    }

    const admin = await Admin.findOne({ username }).select("+password");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date();
    await admin.save();

    generateToken(res, admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      admin: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("❌ Admin Auth Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding their passwords
    const users = await User.find({}).select("-password");
    
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Get Users Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
export const logoutAdmin = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Admin logged out successfully" });
  } catch (error) {
    console.error("❌ Admin Logout Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};