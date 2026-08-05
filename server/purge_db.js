import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Restaurant from "./src/models/Restaurants.js";
import Order from "./src/models/Order.js";
import Notification from "./src/models/Notification.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const purgeDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://shujaapasha11789_db_user:98cjp2ru9@ac-ve0ctfj-shard-00-00.smkbsxu.mongodb.net:27017,ac-ve0ctfj-shard-00-01.smkbsxu.mongodb.net:27017,ac-ve0ctfj-shard-00-02.smkbsxu.mongodb.net:27017/CampusConnect?ssl=true&replicaSet=atlas-qrmidp-shard-0&authSource=admin&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("📡 Connected to MongoDB for database purge...");

    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Restaurant.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    console.log("✅ All restaurants, vendors, riders, orders, and notifications deleted.");

    const Salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", Salt);

    const campusAdmin = await User.create({
      name: "Campus Admin",
      email: "campusadmin@campusconnect.com",
      registeration_number: "2020F-campusadmin-001",
      password: "password123",
      role: "campus_admin",
      department: "Administration",
      semester: 0,
      program: "Management",
      section: "A",
      restaurant: null,
      vehicle: "",
      riderStatus: "",
      riderPhone: ""
    });

    console.log("✅ Single Campus Admin created:", campusAdmin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Purge error:", err);
    process.exit(1);
  }
};

purgeDatabase();
