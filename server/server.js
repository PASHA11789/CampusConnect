import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./utils/db.js";
import { globalLimiter, authLimiter } from "./src/middleware/rateLimiter.js";

import authRoutes from "./src/routes/authRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import forumRoutes from "./src/routes/forumRoutes.js"
import notificationRoutes from "./src/routes/notificationRoutes.js"
import petitionRoutes from "./src/routes/petitionRoutes.js"
import modRoutes from "./src/routes/modroutes.js"
import LostFoundRoutes from "./src/routes/lostfoundRoutes.js";
import canteenRoutes from "./src/routes/canteenRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
import vendorAuthRoutes from "./src/routes/vendorAuthRoutes.js";
import campusAdminRoutes from "./src/routes/campusAdminRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import careerRoutes from "./src/routes/careerRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import complaintRoutes from "./src/routes/complaintRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// ── CORS Configuration ─────────────────────────────────────────────────────
// Only allow requests from known frontend origins instead of open cors().
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((u) => u.trim());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

app.set("socketio", io);

connectDB();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://ui-avatars.com"],
        connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
// Locked-down CORS — only allowed origins may make requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, server-to-server, Postman in dev)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false); // Reject gracefully without crashing
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ── NoSQL Injection Defence ────────────────────────────────────────────────
// Strips MongoDB operator keys ($) from req.body, req.params, AND req.query.
const stripDollarKeys = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripDollarKeys);
  return Object.keys(obj).reduce((acc, key) => {
    if (key.startsWith("$")) return acc; // drop operator keys
    acc[key] = stripDollarKeys(obj[key]);
    return acc;
  }, {});
};
app.use((req, _res, next) => {
  if (req.body) req.body = stripDollarKeys(req.body);
  if (req.params) req.params = stripDollarKeys(req.params);
  // Sanitize query strings — Express 5 makes req.query read-only,
  // so we clone it onto a writable object and re-assign.
  if (req.query && typeof req.query === "object") {
    const sanitized = stripDollarKeys({ ...req.query });
    // Overwrite each key in-place for Express 5 compatibility
    for (const key of Object.keys(req.query)) {
      if (key.startsWith("$")) {
        delete req.query[key];
      }
    }
    Object.assign(req.query, sanitized);
  }
  next();
});

// ── Rate Limiting — DDoS Protection ────────────────────────────────────────
app.use("/api/", globalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/vendor/auth", authLimiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("The CampusConnect API is working");
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/notifications",notificationRoutes)
app.use("/api/petitions", petitionRoutes)
app.use("/api/moderation", modRoutes)
app.use('/api/lost-found',LostFoundRoutes)
app.use("/api/canteen", canteenRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/vendor/auth", vendorAuthRoutes);
app.use("/api/campus-admin", campusAdminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/complaints", complaintRoutes);

// ── Socket.IO — Hardened Connection Handling ───────────────────────────────
// Only allow joining known/public rooms. Block mod_room from unauthorized users.
const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const ALLOWED_PUBLIC_ROOMS = new Set(["riders", "Campus"]);

io.on("connection", (socket) => {
  console.log(`⚡ Student connected to live updates: ${socket.id}`);

  socket.on("join_user_room", (userId) => {
    // Only allow joining if userId looks like a valid Mongo ObjectId
    if (typeof userId === "string" && MONGO_ID_REGEX.test(userId)) {
      socket.join(userId);
      console.log(`User ${userId} secured their private notification channel`);
    }
  });

  socket.on("join_room", (roomName) => {
    if (typeof roomName !== "string" || !roomName.trim()) return;

    // Block mod_room and admin rooms from being freely joined via socket
    if (roomName === "mod_room" || roomName.startsWith("mod_room_")) {
      console.warn(`⚠ Socket ${socket.id} tried to join restricted room: ${roomName}`);
      return;
    }

    // Allow public rooms and department/class group rooms
    if (ALLOWED_PUBLIC_ROOMS.has(roomName) || MONGO_ID_REGEX.test(roomName)) {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    } else {
      // Allow department and class string rooms (e.g., "BS-CS-5-A")
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    }
  });

  // Authenticated mod room join — only via server-side emission
  socket.on("join_mod_room", (data) => {
    // Mods join via client passing their role; server verifies on API side
    // This is an extra layer — actual mod operations are behind protect + authorizeCampusRoles
    if (data && typeof data.role === "string" &&
      ["admin", "campus_admin", "student_mod"].includes(data.role)) {
      socket.join("mod_room");
      console.log(`Mod socket ${socket.id} joined mod_room (role: ${data.role})`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Student disconnected from live updates");
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `The server is listening at ${PORT} in ${process.env.NODE_ENV || "development"}`,
  );
});
