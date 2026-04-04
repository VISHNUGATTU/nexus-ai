import Command from "../models/Command.js";
import axios from "axios";
import { publishCommandToAI } from "../config/kafka.js"; // Adjust path if you used 'configs/kafka.js'

// @desc    Process user command & append to thread
// @route   POST /api/commands
export const processCommand = async (req, res) => {
  try {
    const { prompt, chatId } = req.body; // <-- Extract chatId from frontend

    if (!prompt) return res.status(400).json({ success: false, message: "Please provide a prompt" });

    let chatSession;
    const newMessage = { prompt, status: "pending" };

    // 1. If we are continuing a chat, push to it. Otherwise, create a new one.
    if (chatId) {
      chatSession = await Command.findById(chatId);
      if (!chatSession) return res.status(404).json({ success: false, message: "Chat not found" });
      
      chatSession.messages.push(newMessage);
      await chatSession.save();
    } else {
      // Create new chat. Use first 30 chars of prompt as title.
      chatSession = await Command.create({
        user: req.user._id,
        title: prompt.substring(0, 30) + (prompt.length > 30 ? "..." : ""),
        messages: [newMessage],
      });
    }

    // 2. Get the specific ID of the message we just created
    const createdMessage = chatSession.messages[chatSession.messages.length - 1];

    // 3. Send the MESSAGE ID to Python (Python doesn't need to know about the Chat Session)
    try {
      await axios.post("http://localhost:5000/execute", {
        commandId: createdMessage._id, // Send the sub-document ID
        prompt: prompt
      }, {
        headers: { 'x-ai-api-key': process.env.AI_ENGINE_SECRET }
      });
    } catch (pythonError) {
      console.error("⚠️ Python Engine Unreachable:", pythonError.message);
    }

    res.status(202).json({
      success: true,
      chatId: chatSession._id, // Tell React which chat we are in
      message: "Command sent to local engine",
    });
  } catch (error) {
    console.error("❌ Process Command Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// @desc    Webhook: Update command status (Called by Python Engine)
// @route   PUT /api/commands/:id/status
export const updateCommandStatus = async (req, res) => {
  try {
    const messageId = req.params.id; // This is the createdMessage._id we sent to Python
    const { status, aiResponse, actionTriggered, targetPath, errorMessage } = req.body;

    // Build the update object dynamically
    const updateFields = {};
    if (status) updateFields["messages.$.status"] = status;
    if (aiResponse) updateFields["messages.$.aiResponse"] = aiResponse;
    if (actionTriggered) updateFields["messages.$.actionTriggered"] = actionTriggered;
    if (targetPath) updateFields["messages.$.targetPath"] = targetPath;
    if (errorMessage) updateFields["messages.$.errorMessage"] = errorMessage;

    // Find the chat that contains this message, and update that specific message in the array
    const chat = await Command.findOneAndUpdate(
      { "messages._id": messageId },
      { $set: updateFields },
      { returnDocument: 'after' } // <--- THE NEW MONGOOSE STANDARD
    );

    if (!chat) return res.status(404).json({ success: false, message: "Message not found" });

    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("❌ Update Command Status Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


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