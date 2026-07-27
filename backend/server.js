require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./lib/db");

const githubRoutes = require("./routes/github");
const contributionsRoutes = require("./routes/contributions");
const aiRoutes = require("./routes/ai");
const healthRoutes = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const frontendUrl = process.env.FRONTEND_URL;
      if (frontendUrl === "*" || !frontendUrl) return callback(null, true);
      const allowed = frontendUrl.split(",").map((u) => u.trim());
      allowed.push("http://localhost:3000", "http://localhost:3001");
      if (allowed.includes(origin) || allowed.some(url => origin.endsWith(url))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in production API fallback
    },
    credentials: true,
  })
);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Routes
app.use("/api/github", githubRoutes);
app.use("/api/github", contributionsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/health", healthRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  });
});

// Start server
async function start() {
  try {
    // Connect to MongoDB (will create indexes if needed)
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn("⚠️  MONGODB_URI not set — caching disabled, running without database");
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});

start();
