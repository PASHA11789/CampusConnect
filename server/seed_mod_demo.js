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

    console.log("\n🧹 1. Cleaning all existing public posts, petitions, forums, reports, & complaints...");
    await Petition.deleteMany({});
    await Forum.deleteMany({});
    await CareerThread.deleteMany({});
    await LostFound.deleteMany({});
    await Report.deleteMany({});
    await Complaint.deleteMany({});
    console.log("✅ All old public posts and moderation items cleared successfully!");

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", salt);

    console.log("\n👤 2. Creating / updating demo user accounts...");

    const usersData = [
      {
        name: "Super Admin",
        email: "admin@campusconnect.com",
        registeration_number: "2020F-muladmin-001",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        semester: 0,
        avatar: "https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff",
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
        avatar: "https://ui-avatars.com/api/?name=Shujaat+Ali&background=6f42c1&color=fff",
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
        avatar: "https://ui-avatars.com/api/?name=Reporter+Student&background=28a745&color=fff",
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
        avatar: "https://ui-avatars.com/api/?name=Ali+Raza&background=17a2b8&color=fff",
      },

      // --- POLICY-VIOLATING / VULGAR TEST USERS ---
      {
        name: "X-Rated VulgarTroll99",
        email: "vulgar1@campusconnect.com",
        registeration_number: "2024F-mulbscs-999",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 2,
        program: "BSCS",
        section: "C",
        avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400", // Troll avatar
      },
      {
        name: "Scammer_Certificates_Selling",
        email: "fakecert@campusconnect.com",
        registeration_number: "2024F-mulbba-888",
        password: hashedPassword,
        role: "student",
        department: "Business Administration",
        semester: 3,
        program: "BBA",
        section: "A",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      },
      {
        name: "Toxic_Abusive_Student",
        email: "abusive_user@campusconnect.com",
        registeration_number: "2023F-mulee-777",
        password: hashedPassword,
        role: "student",
        department: "Electrical Engineering",
        semester: 5,
        program: "BSEE",
        section: "B",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      },
      {
        name: "Inappropriate_Pic_User",
        email: "nude_avatar@campusconnect.com",
        registeration_number: "2024F-mulmath-666",
        password: hashedPassword,
        role: "student",
        department: "Mathematics",
        semester: 1,
        program: "BSMath",
        section: "A",
        avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400",
      },
      {
        name: "Illegal_Gambling_King",
        email: "gambling_spammer@campusconnect.com",
        registeration_number: "2024F-mulmedia-555",
        password: hashedPassword,
        role: "student",
        department: "Media Studies",
        semester: 2,
        program: "BSMedia",
        section: "A",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400",
      },
    ];

    const users = {};
    for (const u of usersData) {
      let existing = await User.findOne({
        $or: [
          { email: u.email },
          { registeration_number: u.registeration_number }
        ]
      });
      if (!existing) {
        existing = await User.create(u);
      } else {
        existing.name = u.name;
        existing.email = u.email;
        existing.registeration_number = u.registeration_number;
        existing.avatar = u.avatar;
        existing.role = u.role;
        existing.password = u.password;
        await existing.save();
      }
      users[u.email] = existing;
    }

    const admin = users["admin@campusconnect.com"];
    const mod = users["shujaat@mod.com"];
    const reporter = users["reporter@campusconnect.com"];
    const ali = users["ali.raza@campusconnect.com"];

    const vulgar1 = users["vulgar1@campusconnect.com"];
    const fakecert = users["fakecert@campusconnect.com"];
    const abusiveUser = users["abusive_user@campusconnect.com"];
    const nudeAvatarUser = users["nude_avatar@campusconnect.com"];
    const gamblingSpammer = users["gambling_spammer@campusconnect.com"];

    console.log("✅ 9 Demo User Accounts Created / Verified!");

    // 3. Create Public Petitions (Pending Approval)
    console.log("\n📜 3. Creating Public Petitions (Pending Moderation Approval)...");
    await Petition.create([
      {
        title: "Abolish 80% Mandatory Attendance for Winter Semester",
        description: "Due to severe winter morning fog and transport delays, we petition the university admin to lower the minimum attendance threshold from 80% to 65%.",
        creator: ali._id,
        level: "Campus",
        status: "Pending Mod Approval",
        signatures: [ali._id, reporter._id],
        milestone: 50,
      },
      {
        title: "Request for Free High-Speed Wi-Fi in CS Department Labs",
        description: "CS students need unthrottled access to GitHub and Docker registry during lab sessions.",
        creator: vulgar1._id,
        level: "Department",
        targetGroup: "Computer Science",
        status: "Pending Mod Approval",
        signatures: [vulgar1._id],
        milestone: 20,
      },
      {
        title: "Cancel All Midterm Exams and Give Everyone 100% Free Marks",
        description: "Exams cause too much stress. We demand automatic passing grades for all students without taking tests.",
        creator: abusiveUser._id,
        level: "Campus",
        status: "Pending Mod Approval",
        signatures: [abusiveUser._id],
        milestone: 100,
      },
    ]);
    console.log("✅ 3 Pending Petitions created!");

    // 4. Create Public Forums (Flagged & Reported)
    console.log("\n💬 4. Creating Public Forum Discussions (Flagged/Reported)...");
    await Forum.create([
      {
        title: "🔥 FAST CASH & LEAKED EXAM PAPERS 🔥",
        content: "Message me on Telegram for leaked midterms and illegal cheats. Guaranteed A+ grades for $20!",
        author: gamblingSpammer._id,
        reportedBy: [reporter._id, ali._id],
        reports: [
          {
            user: reporter._id,
            reason: "Academic dishonesty and illegal spam promotion",
            createdAt: new Date(),
          },
          {
            user: ali._id,
            reason: "Cheating service promotion",
            createdAt: new Date(),
          },
        ],
        isHidden: false,
      },
      {
        title: "Tips for preparing for Database Systems Midterm?",
        content: "Anyone have good summary slides for ER diagrams, normalization, and SQL joins?",
        author: ali._id,
        replies: [
          {
            author: abusiveUser._id,
            content: "Forget studying! Buy my leaked solutions instead, you absolute losers!",
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
      },
      {
        title: "Uncensored Illegal Stuff Exchange Group",
        content: "Join our secret server where we post unauthorized material and break campus rules.",
        author: vulgar1._id,
        reportedBy: [reporter._id],
        reports: [
          {
            user: reporter._id,
            reason: "Illegal activities and community violation",
            createdAt: new Date(),
          },
        ],
        isHidden: true,
      },
    ]);
    console.log("✅ 3 Public Forum Threads & Toxic Replies created!");

    // 5. Create Flagged Career Threads
    console.log("\n💼 5. Creating Flagged Career & Internship Threads...");
    await CareerThread.create([
      {
        title: "Buy Fake Internship Certificates for Resume Boosting",
        content: "Don't waste time working 3 months. Pay $50 for a verified software engineering internship certificate with fake manager recommendation letter.",
        category: "internship",
        author: fakecert._id,
        reportedBy: [reporter._id],
        reports: [
          {
            user: reporter._id,
            reason: "Illegal services and fraud",
            createdAt: new Date(),
          },
        ],
        isHidden: false,
      },
      {
        title: "Earn $500/day clicking links - No skills or experience needed",
        content: "Click link below to register for guaranteed online income strategy.",
        category: "job_opportunity",
        author: gamblingSpammer._id,
        reportedBy: [ali._id],
        reports: [
          {
            user: ali._id,
            reason: "Phishing spam scam",
            createdAt: new Date(),
          },
        ],
        isHidden: false,
      },
    ]);
    console.log("✅ 2 Flagged Career Threads created!");

    // 6. Create Lost & Found Items
    console.log("\n🔍 6. Creating Lost & Found Items (Flagged + Old Unclaimed)...");
    await LostFound.create([
      {
        type: "FOUND",
        itemName: "Suspicious Unattended Package in Library",
        description: "Black backpack left unattended on 2nd floor library near room 204.",
        location: "Library 2nd Floor",
        category: "Other",
        status: "Open",
        reporter: vulgar1._id,
        reportedBy: [reporter._id],
        isHidden: true,
      },
      {
        type: "LOST",
        itemName: "Leather Wallet with CS Student ID (Lost 15 days ago)",
        description: "Brown leather wallet containing cash and CS student ID card.",
        location: "Student Cafeteria",
        category: "Wallet",
        status: "Open",
        reporter: ali._id,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days old (Unclaimed)
      },
    ]);
    console.log("✅ 2 Lost & Found items created!");

    // 7. Profile Reports against Vulgar / Policy-Violating Users
    console.log("\n🚨 7. Creating Profile Violation Reports against Vulgar Users...");
    await Report.create([
      {
        reportedBy: reporter._id,
        targetUser: vulgar1._id,
        type: "Profile_Violation",
        reason: "Inappropriate Vulgar Profile Picture & Offensive Username",
        details: "This student profile displays explicit/vulgar content in their avatar and name, and posts spam across CS forums.",
        status: "Pending",
      },
      {
        reportedBy: ali._id,
        targetUser: nudeAvatarUser._id,
        type: "Profile_Violation",
        reason: "Explicit / Inappropriate Profile Avatar",
        details: "Profile avatar image violates campus decency standards.",
        status: "Pending",
      },
      {
        reportedBy: reporter._id,
        targetUser: fakecert._id,
        type: "Profile_Violation",
        reason: "Scammer & Commercial Spam Username",
        details: "User account created specifically to sell fake internship certificates to students.",
        status: "Pending",
      },
    ]);
    console.log("✅ 3 Profile Reports created!");

    // 8. Pending & Escalated Complaints
    console.log("\n📋 8. Creating Student Complaints & Suggestions...");
    await Complaint.create([
      {
        title: "Broken AC Units in CS Building Room 302",
        description: "The air conditioners in Lab 302 have not been functional for 2 weeks, causing extreme heat during afternoon sessions.",
        type: "complaint",
        category: "Facilities",
        submittedBy: ali._id,
        status: "Pending",
        isEscalated: false,
      },
      {
        title: "Fee Portal Showing Incorrect Late Fine Charges",
        description: "My semester fee was paid before the due date, yet the student portal is reflecting an erroneous Rs. 5000 late fine.",
        type: "complaint",
        category: "Administration",
        submittedBy: reporter._id,
        status: "Under Review",
        isEscalated: true,
        escalatedBy: mod._id,
      },
    ]);
    console.log("✅ 2 Complaints created!");

    console.log("\n====================================================");
    console.log("🎉 ALL OLD POSTS CLEARED & NEW MODERATION DEMO SEEDED!");
    console.log("====================================================");
    console.log("Log in with any account (Password: password123):");
    console.log(" 👑 Admin:                 admin@campusconnect.com");
    console.log(" 🛡️ Student Mod:           shujaat@mod.com");
    console.log(" 👤 Reporter Student:      reporter@campusconnect.com");
    console.log(" 👤 Ali Raza (Student):    ali.raza@campusconnect.com");
    console.log("\n ⚠️ Policy-Violating / Vulgar Accounts:");
    console.log("  1. X-Rated VulgarTroll99:       vulgar1@campusconnect.com");
    console.log("  2. Scammer_Certificates_Selling: fakecert@campusconnect.com");
    console.log("  3. Toxic_Abusive_Student:        abusive_user@campusconnect.com");
    console.log("  4. Inappropriate_Pic_User:       nude_avatar@campusconnect.com");
    console.log("  5. Illegal_Gambling_King:        gambling_spammer@campusconnect.com");
    console.log("\nMod Room Queue Now Contains:");
    console.log("  - 3 Pending Petitions");
    console.log("  - 3 Flagged Forum Items");
    console.log("  - 2 Flagged Career Threads");
    console.log("  - 2 Lost & Found items (1 Flagged, 1 Old Unclaimed)");
    console.log("  - 3 Profile Reports (Explicit/Vulgar Avatars & Names)");
    console.log("  - 2 Complaints/Suggestions");
    console.log("====================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding mod demo data:", error);
    process.exit(1);
  }
};

seedModData();
