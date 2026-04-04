import mongoose from "mongoose";

// The individual prompt/response block
const messageSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    default: "Processing command...",
  },
  actionTriggered: {
    type: String,
    default: null,
  },
  targetPath: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  errorMessage: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// The master chat thread that holds the messages
const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "New Chat",
  },
  messages: [messageSchema], // <--- Here is the magic array
}, {
  timestamps: true,
});

chatSessionSchema.index({ createdAt: -1 });

const Command = mongoose.model("Command", chatSessionSchema);

export default Command;