import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./utils/db.js";

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

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.use(cors());  
app.use(express.json());
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


io.on("connection", (socket) => {
  console.log(`⚡ Student connected to live updates: ${socket.id}`);

  socket.on("join_user_room", (userId)=>{
    socket.join(userId)
    console.log(`User ${userId} secured their private notification channel`)
  })

  socket.on("join_room", (roomName) => {
    socket.join(roomName)
    console.log(`Socket ${socket.id} joined room ${roomName}`)
  })

  socket.on("disconnect", () => {
    console.log("❌ Student disconnected from live updates");
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `The server is listening at ${PORT} in ${process.env.NODE_ENV || "development"}`,
  );
});
