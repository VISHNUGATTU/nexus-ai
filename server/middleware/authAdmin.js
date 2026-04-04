import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const authAdmin = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Fallback to standard Bearer token in headers
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access admin route. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up the ID in the Admin collection
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "The admin belonging to this token no longer exists.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Admin Auth Middleware Error:", error.message);
    
    return res.status(401).json({
      success: false,
      message: "Not authorized, admin token failed or expired.",
    });
  }
};