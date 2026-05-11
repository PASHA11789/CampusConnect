import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import connectDB from "./utils/db.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("📡 Seeder is connecting to:", process.env.MONGO_URI);
    await User.deleteMany();
    console.log("prievious users deleted");
    const Salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", Salt);
    const dummyUsers = [
      // --- ADMIN ---
      {
        name: "Super Admin",
        email: "admin@campusconnect.com",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        semester: 0,
      },

      // --- STUDENT MODS (Active Seniors) ---
      {
        name: "Shujaat Ali",
        email: "shujaat@mod.com",
        password: hashedPassword,
        role: "student_mod",
        department: "Computer Science",
        semester: 8,
      },
      {
        name: "Usama Syed",
        email: "usama@mod.com",
        password: hashedPassword,
        role: "student_mod",
        department: "Information Technology",
        semester: 7,
      },

      // --- ALUMNI (Semester set to 0 as they are graduated) ---
      {
        name: "Javeria Khan",
        email: "javeria@alumni.com",
        password: hashedPassword,
        role: "alumni",
        department: "Software Engineering",
        semester: 0,
      },
      {
        name: "Azam Ahmed",
        email: "azam@alumni.com",
        password: hashedPassword,
        role: "alumni",
        department: "Computer Science",
        semester: 0,
      },

      // --- STUDENTS ---
      {
        name: "Hamza Malik",
        email: "hamza@student.com",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 4,
      },
      {
        name: "Zoya Sheikh",
        email: "zoya@student.com",
        password: hashedPassword,
        role: "student",
        department: "Data Science",
        semester: 2,
      },
      {
        name: "Bilal Farooqi",
        email: "bilal@student.com",
        password: hashedPassword,
        role: "student",
        department: "Cyber Security",
        semester: 6,
      },
      {
        name: "Fatima Noor",
        email: "fatima@student.com",
        password: hashedPassword,
        role: "student",
        department: "Software Engineering",
        semester: 5,
      },
      {
        name: "Ali Raza",
        email: "ali@student.com",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 3,
      },
    ];
    await User.insertMany(dummyUsers);
    console.log("✅ 10 Dummy Users created successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};
seedUsers();
