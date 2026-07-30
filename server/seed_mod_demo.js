import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import User from "./src/models/User.js";
import Forum from "./src/models/Forum.js";
import Petition from "./src/models/Petition.js";
import LostFound from "./src/models/lostFound.js";
import CareerThread from "./src/models/CareerThread.js";
import Report from "./src/models/Report.js";
import Complaint from "./src/models/Complaint.js";

dotenv.config();

const seedModData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusconnect";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Connected! Creating mod testing data...");

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", salt);

    // 1. Ensure / Upsert Users
    const usersData = [
      {
        name: "Super Admin",
        email: "admin@campusconnect.com",
        registeration_number: "2020F-muladmin-001",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        semester: 0,
      },
      {
        name: "Shujaat Ali (Mod)",
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
        name: "Reporter Student",
        email: "reporter@campusconnect.com",
        registeration_number: "2023F-mulbscs-042",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 4,
        program: "BSCS",
        section: "B",
      },
      {
        name: "X-Rated VulgarTroll99",
        email: "vulgartroll@campusconnect.com",
        registeration_number: "2024F-mulbscs-999",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 2,
        program: "BSCS",
        section: "C",
        avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
      },
      {
        name: "Ali Raza",
        email: "ali.raza@campusconnect.com",
        registeration_number: "2023F-mulse-015",
        password: hashedPassword,
        role: "student",
        department: "Software Engineering",
        semester: 4,
        program: "BSSE",
        section: "A",
      },
    ];

    const users = {};
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
      } else {
        existing.name = u.name;
        existing.avatar = u.avatar || existing.avatar;
        await existing.save();
      }
      users[u.email] = existing;
    }

    const admin = users["admin@campusconnect.com"];
    const mod = users["shujaat@mod.com"];
    const reporter = users["reporter@campusconnect.com"];
    const vulgarUser = users["vulgartroll@campusconnect.com"];
    const ali = users["ali.raza@campusconnect.com"];

    console.log("Users ready!");

    // 2. Create Public Activity for Vulgar Profile Student
    const vulgarForum = await Forum.create({
      title: "🔥 FAST CASH & LEAKED EXAM PAPERS 🔥",
      content: "Message me for leaked midterms and illegal cheats. Guaranteed A+ grades!",
      author: vulgarUser._id,
      reportedBy: [reporter._id],
      reports: [
        {
          user: reporter._id,
          reason: "Academic dishonesty and spam promotion",
          createdAt: new Date(),
        },
      ],
      isHidden: false,
    });

    const normalForum = await Forum.create({
      title: "Tips for preparing for Database Systems Midterm?",
      content: "Anyone have good summary slides for ER diagrams and SQL joins?",
      author: ali._id,
      replies: [
        {
          author: vulgarUser._id,
          content: "Forget studying! Buy my leaked solutions instead, you losers!",
          reportedBy: [reporter._id],
          reports: [
            {
              user: reporter._id,
              reason: "Offensive language and toxic spam reply",
              createdAt: new Date(),
            },
          ],
        },
      ],
    });

    console.log("Forum posts & reported replies created!");

    // 3. Create Profile Report for Vulgar User
    await Report.deleteMany({ targetUser: vulgarUser._id });
    const profileReport = await Report.create({
      reportedBy: reporter._id,
      targetUser: vulgarUser._id,
      type: "Profile_Violation",
      reason: "Inappropriate Vulgar Profile Picture & Offensive Username",
      details: "This student profile is displaying explicit content in their avatar and name, and posting spam across CS forums.",
      status: "Pending",
    });

    console.log("Profile report created!");

    // 4. Pending Petitions
    const petition1 = await Petition.create({
      title: "Abolish 80% Mandatory Attendance for Winter Semester",
      description: "Due to severe winter morning fog and transport delays, we petition the university admin to lower the minimum attendance threshold from 80% to 65%.",
      creator: ali._id,
      level: "Campus",
      status: "Pending Mod Approval",
      signatures: [ali._id, reporter._id],
      milestone: 50,
    });

    const petition2 = await Petition.create({
      title: "Request for Free High-Speed Wi-Fi in CS Department Labs",
      description: "CS students need unthrottled access to GitHub and Docker registry during lab sessions.",
      creator: vulgarUser._id,
      level: "Department",
      targetGroup: "Computer Science",
      status: "Pending Mod Approval",
      signatures: [vulgarUser._id],
      milestone: 20,
    });

    console.log("Pending petitions created!");

    // 5. Flagged Career Thread
    const careerThread = await CareerThread.create({
      title: "Buy Fake Internship Certificates for Resume Boosting",
      content: "Don't waste time working 3 months. Pay $50 for a verified software engineering internship certificate.",
      category: "internship",
      author: vulgarUser._id,
      reportedBy: [reporter._id],
      reports: [
        {
          user: reporter._id,
          reason: "Illegal services and fraud",
          createdAt: new Date(),
        },
      ],
      isHidden: false,
    });

    console.log("Flagged career thread created!");

    // 6. Flagged & Old Unclaimed Lost & Found
    const flaggedLF = await LostFound.create({
      type: "FOUND",
      itemName: "Suspicious Unattended Bag in Library",
      description: "Black backpack left unattended on 2nd floor library near room 204.",
      location: "Library 2nd Floor",
      category: "Other",
      status: "Open",
      reporter: vulgarUser._id,
      reportedBy: [reporter._id],
      isHidden: true,
    });

    const oldLF = await LostFound.create({
      type: "LOST",
      itemName: "Leather Wallet with Student ID (Lost 2 weeks ago)",
      description: "Brown leather wallet containing cash and CS student ID card.",
      location: "Student Cafeteria",
      category: "Wallet",
      status: "Open",
      reporter: ali._id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days old
    });

    console.log("Lost & Found items created!");

    // 7. Pending Complaints
    const complaint1 = await Complaint.create({
      title: "Broken AC Units in CS Building Room 302",
      description: "The air conditioners in Lab 302 have not been functional for 2 weeks, causing extreme heat during afternoon sessions.",
      type: "complaint",
      category: "Facilities",
      submittedBy: ali._id,
      status: "Pending",
      isEscalated: false,
    });

    const complaint2 = await Complaint.create({
      title: "Fee Portal Showing Incorrect Late Fine Charges",
      description: "My semester fee was paid before the due date, yet the student portal is reflecting an erroneous Rs. 5000 late fine.",
      type: "complaint",
      category: "Administration",
      submittedBy: reporter._id,
      status: "Under Review",
      isEscalated: true,
      escalatedBy: mod._id,
    });

    console.log("Complaints created!");

    console.log("\n====================================================");
    console.log("🎉 MODERATION DEMO TEST DATA SEEDED SUCCESSFULLY!");
    console.log("====================================================");
    console.log("You can log in with any of these accounts (Password: password123):");
    console.log(" 👑 Admin: admin@campusconnect.com");
    console.log(" 🛡️ Student Mod: shujaat@mod.com");
    console.log(" 👤 Reporter Student: reporter@campusconnect.com");
    console.log(" ⚠️ Vulgar Troll Student: vulgartroll@campusconnect.com");
    console.log("\nMod Room queue now contains:");
    console.log("  - 1 Profile Report (for 'X-Rated VulgarTroll99')");
    console.log("  - 2 Pending Petitions");
    console.log("  - 2 Flagged Forum items (1 thread, 1 reply)");
    console.log("  - 1 Flagged Career Thread");
    console.log("  - 2 Lost & Found items (1 flagged, 1 old unclaimed)");
    console.log("  - 2 Pending/Escalated Complaints");
    console.log("====================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding mod demo data:", error);
    process.exit(1);
  }
};

seedModData();
