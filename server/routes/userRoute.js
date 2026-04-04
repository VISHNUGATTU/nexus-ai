import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  isAuth, 
  uploadAvatar 
} from "../controllers/userController.js";
import { authUser } from "../middleware/authUser.js";
import {upload} from "../config/multer.js"; 

const userRouter = express.Router();

// ✅ Public Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// ✅ Protected Session & Auth Routes
userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/logout", authUser, logoutUser);

// ✅ Protected Profile Routes
userRouter.post("/avatar", authUser, upload.single("image"), uploadAvatar);

export default userRouter;