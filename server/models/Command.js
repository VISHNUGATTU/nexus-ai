import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: String,
      required: [true, "Command prompt is required"],
      trim: true,
    },
    aiResponse: {
      type: String,
      default: "Processing command...",
    },
    actionTriggered: {
      type: String,
      default: null, // e.g., 'open_application', 'open_website'
    },
    targetPath: {
      type: String,
      default: null, // e.g., 'spotify.exe' or 'https://youtube.com'
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
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// ✅ Add an index to sort queries faster since you will likely fetch history by newest first
commandSchema.index({ createdAt: -1 });

const Command = mongoose.model("Command", commandSchema);

export default Command;