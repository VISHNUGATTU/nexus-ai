import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authUser = async (req, res, next) => {
  try {
    let token;

    // ✅ 1. Check for token in cookies (VisOra Secure Standard)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // ✅ 2. Fallback to standard Bearer token in headers
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);
    
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired.",
    });
  }
};