import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import connectDB from "./utils/db.js";

dotenv.config();

const addZainab = async () => {
  try {
    await connectDB();
    console.log("📡 Connecting to DB...");
    
    // Delete existing user if present to ensure clean insert
    await User.deleteOne({ email: "zainab.pharmacy@campusconnect.com" });

    const userData = {
      name: "Zainab Chaudhry (D.Pharm)",
      email: "zainab.pharmacy@campusconnect.com",
      registeration_number: "2024F-muldpharm-170",
      password: "password123", // Mongoose pre-save hook will hash this once
      role: "student",
      department: "D.Pharm",
      semester: 4,
      program: "D.Pharm",
      section: "A",
    };

    await User.create(userData);
    console.log("✅ Zainab Chaudhry user created with single-hashed password!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding Zainab:", err);
    process.exit(1);
  }
};

addZainab();
