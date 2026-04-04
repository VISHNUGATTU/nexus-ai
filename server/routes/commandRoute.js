import express from "express";
import {
  processCommand,
  getCommandHistory,
  updateCommandStatus,
  clearCommandHistory,
  deleteCommand,
  updateCommandTitle,
} from "../controllers/commandController.js";
import { authUser } from "../middleware/authUser.js";

const commandRouter = express.Router();

// ✅ Protected User Routes (Your React Frontend calls these)
commandRouter.post("/", authUser, processCommand);
commandRouter.get("/history", authUser, getCommandHistory);
commandRouter.delete("/clear-history", authUser, clearCommandHistory);

// ✅ Internal Webhook Route (Your Python AI Engine calls this)
// Note: Left unprotected so your local Python script can easily send HTTP PUT requests
const verifyAIEngine = (req, res, next) => {
  const apiKey = req.headers['x-ai-api-key'];
  if (apiKey !== process.env.AI_ENGINE_SECRET) {
    return res.status(403).json({ success: false, message: "Forbidden: Invalid AI Engine Secret" });
  }
  next();
};
commandRouter.put("/:id/status", verifyAIEngine, updateCommandStatus);
commandRouter.delete("/:id", authUser, deleteCommand);
commandRouter.put("/:id/title", authUser, updateCommandTitle);

export default commandRouter;