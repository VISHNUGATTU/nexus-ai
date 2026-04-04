import express from "express";
import { 
  registerAdmin, 
  loginAdmin, 
  logoutAdmin, 
  getAllUsers 
} from "../controllers/adminController.js";
import { authAdmin } from "../middleware/authAdmin.js";

const adminRouter = express.Router();

// Public Admin Routes
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);

// Protected Admin Routes
adminRouter.post("/logout", authAdmin, logoutAdmin);
adminRouter.get("/users", authAdmin, getAllUsers); // Only admins can view all users

export default adminRouter;