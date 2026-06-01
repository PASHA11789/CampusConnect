import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Forum from "./src/models/Forum.js";
import connectDB from "./utils/db.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("📡 Seeder is connecting to:", process.env.MONGO_URI);
    
    // Delete existing users and forum threads
    await User.deleteMany();
    console.log("previous users deleted");
    await Forum.deleteMany();
    console.log("previous forum threads deleted");
    
    const Salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", Salt);
    const dummyUsers = [
      // --- ADMIN ---
      {
        name: "Super Admin",
        email: "admin@campusconnect.com",
        registeration_number: "2020F-muladmin-001",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        semester: 0,
      },

      // --- STUDENT MODS (Active Seniors) ---
      {
        name: "Shujaat Ali",
        email: "shujaat@mod.com",
        registeration_number: "2022F-mulbscs-011",
        password: hashedPassword,
        role: "student_mod",
        department: "Computer Science",
        semester: 8,
      },
      {
        name: "Usama Syed",
        email: "usama@mod.com",
        registeration_number: "2023S-mulbsit-022",
        password: hashedPassword,
        role: "student_mod",
        department: "Information Technology",
        semester: 7,
      },

      // --- ALUMNI (Semester set to 0 as they are graduated) ---
      {
        name: "Javeria Khan",
        email: "javeria@alumni.com",
        registeration_number: "2021F-mulbsse-033",
        password: hashedPassword,
        role: "alumni",
        department: "Software Engineering",
        semester: 0,
      },
      {
        name: "Azam Ahmed",
        email: "azam@alumni.com",
        registeration_number: "2020F-mulbscs-044",
        password: hashedPassword,
        role: "alumni",
        department: "Computer Science",
        semester: 0,
      },

      // --- STUDENTS ---
      {
        name: "Hamza Malik",
        email: "hamza@student.com",
        registeration_number: "2024F-mulbscs-055",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 4,
      },
      {
        name: "Zoya Sheikh",
        email: "zoya@student.com",
        registeration_number: "2025F-mulbsds-066",
        password: hashedPassword,
        role: "student",
        department: "Data Science",
        semester: 2,
      },
      {
        name: "Bilal Farooqi",
        email: "bilal@student.com",
        registeration_number: "2023F-mulbscys-077",
        password: hashedPassword,
        role: "student",
        department: "Cyber Security",
        semester: 6,
      },
      {
        name: "Fatima Noor",
        email: "fatima@student.com",
        registeration_number: "2024S-mulbsse-088",
        password: hashedPassword,
        role: "student",
        department: "Software Engineering",
        semester: 5,
      },
      {
        name: "Ali Raza",
        email: "ali@student.com",
        registeration_number: "2025S-mulbscs-099",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 3,
      },
    ];
    const insertedUsers = await User.insertMany(dummyUsers);
    console.log("✅ 10 Dummy Users created successfully!");
    
    // Assign authors for threads and replies
    const studentUser1 = insertedUsers.find(u => u.email === "hamza@student.com");
    const studentUser2 = insertedUsers.find(u => u.email === "zoya@student.com");
    const modUser = insertedUsers.find(u => u.role === "student_mod");

    const dummyThreads = [
      {
        title: "Midterm Exams Preparation",
        content: "Hey guys, when are the midterm exams starting? Let's share study guides and past papers here.",
        author: studentUser1._id,
        replies: [
          {
            content: "They start from next Monday! I have the CS study guide if anyone needs it.",
            author: modUser._id,
            createdAt: new Date(Date.now() - 100000)
          },
          {
            content: "Please share the CS guide! It would be really helpful.",
            author: studentUser2._id,
            createdAt: new Date(Date.now() - 50000)
          }
        ],
        repliesCount: 2
      },
      {
        title: "Canteen Gourmet Menu Review",
        content: "The new Gourmet canteen menu has some great additions. The chicken wrap is amazing!",
        author: studentUser2._id,
        replies: [
          {
            content: "Yes, I tried it yesterday. Highly recommended!",
            author: studentUser1._id,
            createdAt: new Date()
          }
        ],
        repliesCount: 1
      },
      {
        title: "Coding Hackathon next month",
        content: "There's a local hackathon happening next month. Who wants to team up? Looking for a React developer.",
        author: modUser._id,
        replies: [],
        repliesCount: 0
      }
    ];

    await Forum.insertMany(dummyThreads);
    console.log("✅ Dummy Forum threads seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};
seedUsers();
