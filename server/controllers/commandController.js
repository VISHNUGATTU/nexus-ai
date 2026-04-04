import Command from "../models/Command.js";
import axios from "axios";
import { publishCommandToAI } from "../config/kafka.js"; // Adjust path if you used 'configs/kafka.js'

// @desc    Process user command & push to Kafka
// @route   POST /api/commands
export const processCommand = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Please provide a command prompt",
      });
    }

    // 1. Create a pending command log in MongoDB
    const command = await Command.create({
      user: req.user._id,
      prompt: prompt,
      status: "pending",
    });

    // 2. Direct HTTP Call to the Python Flask Engine
    try {
      await axios.post("http://localhost:5000/execute", {
        commandId: command._id,
        prompt: prompt
      }, {
        // THIS IS THE FIX: The Security Handshake
        headers: {
          'x-ai-api-key': process.env.AI_ENGINE_SECRET
        }
      });
    } catch (pythonError) {
      console.error("⚠️ Python Engine Unreachable:", pythonError.message);
      // We don't crash Node, we just let it stay pending (or mark as failed)
    }

    // 3. Respond to the React frontend immediately (202 Accepted)
    res.status(202).json({
      success: true,
      message: "Command sent to local engine",
      command: command,
    });
  } catch (error) {
    console.error("❌ Process Command Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @desc    Get user's command history
// @route   GET /api/commands/history
// @desc    Get user's command history
// @route   GET /api/commands/history
export const getCommandHistory = async (req, res) => {
  try {
    // Fetch the interactions for the logged-in user, newest first
    const history = await Command.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to the last 50 to keep the payload fast

    res.status(200).json({
      success: true,
      count: history.length,
      commands: history, // <--- CHANGED FROM 'history: history'
    });
  } catch (error) {
    console.error("❌ Get Command History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @desc    Webhook: Update command status (Called by Python Engine)
// @route   PUT /api/commands/:id/status
export const updateCommandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, aiResponse, actionTriggered, targetPath, errorMessage } = req.body;

    const command = await Command.findById(id);

    if (!command) {
      return res.status(404).json({
        success: false,
        message: "Command not found",
      });
    }

    // Update fields if they are provided in the request
    if (status) command.status = status;
    if (aiResponse) command.aiResponse = aiResponse;
    if (actionTriggered) command.actionTriggered = actionTriggered;
    if (targetPath) command.targetPath = targetPath;
    if (errorMessage) command.errorMessage = errorMessage;

    await command.save();

    res.status(200).json({
      success: true,
      message: "Command updated successfully",
      command: command,
    });
  } catch (error) {
    console.error("❌ Update Command Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const clearCommandHistory = async (req, res) => {
  try {
    // Delete all commands where the 'user' field matches the authenticated user's ID
    const result = await Command.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} commands.`,
    });
  } catch (error) {
    console.error("❌ Clear History Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: Failed to clear history." 
    });
  }
};

// @desc    Delete a specific command chat
// @route   DELETE /api/commands/:id
export const deleteCommand = async (req, res) => {
  try {
    const command = await Command.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!command) return res.status(404).json({ success: false, message: "Command not found" });
    
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("❌ Delete Command Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Rename a command chat
// @route   PUT /api/commands/:id/title
export const updateCommandTitle = async (req, res) => {
  try {
    const { title } = req.body;
    const command = await Command.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: title },
      { returnDocument: 'after' }
    );
    
    if (!command) return res.status(404).json({ success: false, message: "Command not found" });

    res.status(200).json({ success: true, command });
  } catch (error) {
    console.error("❌ Update Title Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};