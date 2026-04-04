import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Admin username is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Admin password must be at least 8 characters long"], // Stricter for admins
      select: false, 
    },
    permissions: {
      type: [String],
      // Define the specific system permissions this admin has
      default: ["manage_users", "view_system_logs", "execute_system_commands"],
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin", 
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save Middleware: Hash password before saving
adminSchema.pre("save", async function (next) {
  // Only run this if the password field was modified
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// ✅ Instance Method: Compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;