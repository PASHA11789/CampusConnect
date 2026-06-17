import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Forum from "./src/models/Forum.js";
import Petition from "./src/models/Petition.js";
import Restaurant from "./src/models/Restaurants.js";
import Order from "./src/models/Order.js";
import connectDB from "./utils/db.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("📡 Seeder is connecting to:", process.env.MONGO_URI);
    
    // Delete existing users, forum threads, and petitions
    await User.deleteMany();
    console.log("previous users deleted");
    await Forum.deleteMany();
    console.log("previous forum threads deleted");
    await Petition.deleteMany();
    console.log("previous petitions deleted");
    await Restaurant.deleteMany();
    console.log("previous restaurants deleted");
    await Order.deleteMany();
    console.log("previous orders deleted");
    
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
        program: "",
        section: "",
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
        program: "BSCS",
        section: "A",
      },
      {
        name: "Usama Syed",
        email: "usama@mod.com",
        registeration_number: "2023S-mulbsit-022",
        password: hashedPassword,
        role: "student_mod",
        department: "Information Technology",
        semester: 7,
        program: "BSIT",
        section: "B",
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
        program: "BSSE",
        section: "A",
      },
      {
        name: "Azam Ahmed",
        email: "azam@alumni.com",
        registeration_number: "2020F-mulbscs-044",
        password: hashedPassword,
        role: "alumni",
        department: "Computer Science",
        semester: 0,
        program: "BSCS",
        section: "B",
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
        program: "BSCS",
        section: "A",
      },
      {
        name: "Zoya Sheikh",
        email: "zoya@student.com",
        registeration_number: "2025F-mulbsds-066",
        password: hashedPassword,
        role: "student",
        department: "Data Science",
        semester: 2,
        program: "BSDS",
        section: "B",
      },
      {
        name: "Bilal Farooqi",
        email: "bilal@student.com",
        registeration_number: "2023F-mulbscys-077",
        password: hashedPassword,
        role: "student",
        department: "Cyber Security",
        semester: 6,
        program: "BSCY",
        section: "A",
      },
      {
        name: "Fatima Noor",
        email: "fatima@student.com",
        registeration_number: "2024S-mulbsse-088",
        password: hashedPassword,
        role: "student",
        department: "Software Engineering",
        semester: 5,
        program: "BSSE",
        section: "A",
      },
      {
        name: "Ali Raza",
        email: "ali@student.com",
        registeration_number: "2025S-mulbscs-099",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 3,
        program: "BSCS",
        section: "C",
      },
      // --- VENDOR ---
      {
        name: "Campus Bites Vendor",
        email: "vendor@campusconnect.com",
        registeration_number: "2020F-mulvendor-001",
        password: hashedPassword,
        role: "vendor",
        department: "Food Services",
        semester: 0,
        program: "",
        section: "",
      },
    ];
    const insertedUsers = await User.insertMany(dummyUsers);
    console.log("✅ 11 Dummy Users created successfully!");
    
    // Seed Restaurant
    const vendorUser = insertedUsers.find(u => u.email === "vendor@campusconnect.com");
    const dummyRestaurant = {
      name: "Campus Bites",
      owner: vendorUser._id,
      phone: "+923001234567",
      address: "Central Canteen, Block B",
      coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      deliveryRadiusKm: 5,
      menu: [
        {
          name: "Chicken Biryani",
          price: 250,
          description: "Spicy and aromatic basmati rice cooked with chicken and traditional herbs.",
          image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0",
          isAvailable: true
        },
        {
          name: "Zinger Burger",
          price: 200,
          description: "Crispy chicken fillet with lettuce and mayo in a soft bun.",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
          isAvailable: true
        },
        {
          name: "French Fries",
          price: 80,
          description: "Golden and crispy potato fries served with tomato ketchup.",
          image: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
          isAvailable: true
        },
        {
          name: "Soft Drink",
          price: 50,
          description: "Chilled 350ml soda bottle.",
          image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
          isAvailable: true
        }
      ],
      isActive: true
    };

    await Restaurant.create(dummyRestaurant);
    console.log("✅ Dummy Restaurant seeded successfully!");
    
    // Assign authors for threads and replies
    const studentUser1 = insertedUsers.find(u => u.email === "hamza@student.com");
    const studentUser2 = insertedUsers.find(u => u.email === "zoya@student.com");
    const studentUser3 = insertedUsers.find(u => u.email === "bilal@student.com");
    const studentUser4 = insertedUsers.find(u => u.email === "fatima@student.com");
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

    // Add dummy petitions
    const dummyPetitions = [
      {
        title: "Rescheduling CS-401 Midterm Exam",
        description: "The current midterm date conflicts with the national hackathon. We request the department/instructor to reschedule it.",
        creator: studentUser1._id,
        level: "Class",
        signatures: [studentUser1._id, studentUser2._id],
        milestone: 10,
        status: "Active"
      },
      {
        title: "Extended Lab Hours for Software Engineering Department",
        description: "We request the Software Engineering department to keep computer labs open until 7 PM during project weeks.",
        creator: studentUser2._id,
        level: "Department",
        signatures: [studentUser2._id, studentUser1._id, studentUser4._id],
        milestone: 50,
        status: "Active"
      },
      {
        title: "Upgrade Campus Cafeteria Menu & Quality",
        description: "A request to the campus administration to inspect hygiene standards and add healthier food options in the cafeteria.",
        creator: modUser._id,
        level: "Campus",
        signatures: [
          modUser._id,
          studentUser1._id,
          studentUser2._id,
          studentUser3._id,
          studentUser4._id
        ],
        milestone: 100,
        status: "Under Review"
      }
    ];

    await Petition.insertMany(dummyPetitions);
    console.log("✅ Dummy Petitions seeded successfully!");
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};
seedUsers();
