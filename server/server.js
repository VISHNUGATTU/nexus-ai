import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dns from "dns";

// Configs
import  connectDB  from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import { connectKafkaProducer } from "./config/kafka.js";

// Routes
import userRouter from "./routes/userRoute.js";
import commandRouter from "./routes/commandRoute.js";
import adminRouter from "./routes/adminRoute.js";

// Load env variables
dotenv.config();

// Fix DNS for MongoDB Atlas (important for Render or remote deployments)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Initialize app
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Connect Databases, Cloudinary, and Message Broker
await connectDB();
connectCloudinary();
await connectKafkaProducer();

// ✅ Allowed Origins (Local + Production)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser()); // Essential if you decide to use cookie-based auth later

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Mike_AI API is working");
});

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/commands", commandRouter); // We will build this one next if you haven't yet
app.use("/api/admin", adminRouter);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);  

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});