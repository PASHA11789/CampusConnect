import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./utils/db.js";
import authRoutes from "./src/routes/authRoutes.js";

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === " development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("The CampusConnect API is working");
});


app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`The server is listening at ${PORT} in ${process.env.NODE_ENV}`);
});
