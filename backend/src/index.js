import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

console.log(process.env.NODE_ENV);

// 🔹 Ensure Express can parse JSON (Base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For form data
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // Without trailing slash
  "http://localhost:5001", // If your backend calls itself
];

// Apply CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow sending cookies/auth headers
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve static files from dist folder (instead of build folder)
  app.use(express.static(path.join(__dirname, "../frontend", "dist"))); // Correct path to dist

  // Handle all other routes to serve the React index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Log the path for debugging
console.log(path.join(__dirname, "../frontend", "dist", "index.html"));
console.log(process.env.NODE_ENV === "production");

// server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
