import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Forum from "./src/models/Forum.js";
import Petition from "./src/models/Petition.js";
import Restaurant from "./src/models/Restaurants.js";
import Order from "./src/models/Order.js";
import CareerThread from "./src/models/CareerThread.js";
import LostFound from "./src/models/lostFound.js";
import Report from "./src/models/Report.js";
import connectDB from "./utils/db.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("📡 Seeder is connecting to:", process.env.MONGO_URI);

    // Delete existing users, vendors, restaurants, orders, forum, petitions, career, lostFound, reports
    await User.deleteMany();
    console.log("previous users deleted");
    await Vendor.deleteMany();
    console.log("previous vendors deleted");
    await Forum.deleteMany();
    console.log("previous forum threads deleted");
    await Petition.deleteMany();
    console.log("previous petitions deleted");
    await Restaurant.deleteMany();
    console.log("previous restaurants deleted");
    await Order.deleteMany();
    console.log("previous orders deleted");
    await CareerThread.deleteMany();
    console.log("previous career threads deleted");
    await LostFound.deleteMany();
    console.log("previous lost and found items deleted");
    await Report.deleteMany();
    console.log("previous profile reports deleted");

    const Salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", Salt);

    const dummyUsers = [
      // --- CAMPUS ADMIN ---
      {
        name: "Campus Admin",
        email: "campusadmin@campusconnect.com",
        registeration_number: "2020F-campusadmin-001",
        password: hashedPassword,
        role: "campus_admin",
        department: "Administration",
        semester: 0,
        program: "",
        section: "",
      },
    ];

    await User.insertMany(dummyUsers);
    console.log("✅ Single Campus Admin user created successfully!");

    const campusAdmin = await User.findOne({ email: "campusadmin@campusconnect.com" });

    // --- VENDORS ---
    const mcdonaldsVendor = await Vendor.create({
      name: "Ali Khan",
      email: "mcdonalds@campusconnect.com",
      registeration_number: "2026F-mcdonalds-001",
      password: hashedPassword,
      role: "vendor",
      restaurantName: "Mc Donalds",
      phone: "+92 300 1234567",
      avatar: "http://localhost:3000/mcdonalds.svg"
    });
    console.log("✅ McDonald's vendor account created!");

    // --- RESTAURANTS ---
    const mcdonaldsRestaurant = await Restaurant.create({
      name: "Mc Donalds",
      owner: mcdonaldsVendor._id,
      phone: "+92 300 1234567",
      address: "Block A, Minhaj University Campus Lahore",
      coverImage: "http://localhost:3000/mcdonalds.svg",
      deliveryRadiusKm: 5,
      isActive: true,
      menu: [
        { name: "Big Mac Burger", price: 950, description: "Classic double beef patty burger with special sauce, lettuce & cheese.", isAvailable: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
        { name: "McChicken Burger", price: 650, description: "Crispy chicken patty with mayonnaise and lettuce.", isAvailable: true, image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?w=500&q=80" },
        { name: "Crispy French Fries", price: 350, description: "Golden salted crispy French fries.", isAvailable: true, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80" },
        { name: "6 Pc Chicken McNuggets", price: 750, description: "Golden tender chicken McNuggets with dipping sauce.", isAvailable: true, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80" }
      ]
    });
    console.log("✅ McDonald's restaurant created!");

    // --- CAREER THREADS SEEDING ---
    const dummyCareerThreads = [
      {
        title: "Junior Frontend Engineer (React) – Systems Limited",
        content: "Systems Limited is hiring Junior Frontend Engineers for our Lahore office. Candidates with strong React, JavaScript, and Tailwind CSS skills are encouraged to apply.",
        category: "job_opportunity",
        location: "Lahore, Pakistan",
        jobType: "Full-time",
        qualification: "BSCS / Software Engineering",
        company: "Systems Limited",
        companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80",
        author: campusAdmin._id,
        likesCount: 5,
        viewsCount: 45,
        replies: [
          {
            author: campusAdmin._id,
            content: "Applications are open for fresh graduates.",
          },
        ],
      },
      {
        title: "Which tech stack & skills are most in demand for 2026 CS graduates?",
        content: "Let's discuss the most in-demand tech stack and roadmap for next year.",
        category: "general_discussion",
        author: campusAdmin._id,
        likesCount: 8,
        viewsCount: 60,
        replies: [],
      },
    ];

    await CareerThread.insertMany(dummyCareerThreads);
    console.log("✅ Sample Career Threads seeded successfully!");

    // --- FORUM THREADS SEEDING ---
    const dummyForumThreads = [
      {
        title: "Welcome to CampusConnect - Official Campus Portal Announcement",
        content: "Assalam-o-Alaikum everyone! Welcome to the unified CampusConnect platform. Feel free to participate in discussions and petitions.",
        category: "Academics",
        tags: ["Announcement", "CampusConnect"],
        author: campusAdmin._id,
        image: "",
        repliesCount: 0,
        replies: []
      },
    ];

    await Forum.insertMany(dummyForumThreads);
    console.log("✅ Forum Threads seeded successfully!");

    // --- PETITIONS SEEDING ---
    const dummyPetitions = [
      {
        title: "Install Solar Shuttle Charging Hubs & Eco-Friendly Campus Transit",
        description: "Proposing zero-emission electric shuttle carts and solar power stations across university blocks to assist students and staff commuting between distant departments.",
        image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
        creator: campusAdmin._id,
        level: "Campus",
        targetGroup: "Campus",
        signatures: [campusAdmin._id],
        milestone: 100,
        status: "Active",
      },
    ];

    await Petition.insertMany(dummyPetitions);
    console.log("✅ Sample Campus Petition seeded successfully!");

    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.stack || error.message}`);
    process.exit(1);
  }
};
seedUsers();
