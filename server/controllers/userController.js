import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { v2 as cloudinary } from "cloudinary";


export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both username and password" 
      });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const user = await User.create({ username, password });

    if (user) {
      // Set the JWT HTTP-Only cookie
      generateToken(res, user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Invalid user data" 
      });
    }
  } catch (error) {
    console.error("❌ Register Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both username and password" 
      });
    }

    // 1. Look for the user in the database
    const user = await User.findOne({ username }).select("+password");

    // 2. IF USER DOES NOT EXIST -> Return Error (No more auto-register!)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 3. IF USER EXISTS -> Verify Password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    // 4. PASSWORD MATCHES -> Standard Login
    generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const logoutUser = async (req, res) => {
  try {
    // Clear the HTTP-Only cookie by setting its expiration to the past
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Check if user is authenticated & return profile data
// @route   GET /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    // req.user is already populated by the authUser middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("❌ isAuth Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    // Since we are using multer.memoryStorage(), we upload via a stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "mike_ai_avatars" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Cloudinary upload failed" 
          });
        }

        // Update user in DB with the new Cloudinary image URL
        // ✅ CHANGED: { new: true } is now { returnDocument: 'after' }
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { avatarUrl: result.secure_url },
          { returnDocument: 'after' } 
        ).select("-password");

        res.status(200).json({
          success: true,
          message: "Avatar updated successfully",
          user: updatedUser,
        });
      }
    );

    // End the stream and execute the upload
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error("❌ Avatar Upload Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};