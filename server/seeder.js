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
import connectDB from "./utils/db.js";
import bcryptjs from "bcryptjs";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("📡 Seeder is connecting to:", process.env.MONGO_URI);

    // Delete existing users, vendors, restaurants, orders, forum, and petitions
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
      // --- CLASS-LEVEL TEST USERS (BSCS 6th Semester Section A) ---
      {
        name: "Ahmad Raza (BSCS-6A)",
        email: "ahmad.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-101",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Ayesha Malik (BSCS-6A)",
        email: "ayesha.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-102",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Bilal Hassan (BSCS-6A)",
        email: "bilal.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-103",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Danial Tariq (BSCS-6A)",
        email: "danial.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-104",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Esha Imran (BSCS-6A)",
        email: "esha.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-105",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Fahad Mustafa (BSCS-6A)",
        email: "fahad.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-106",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Hassan Ali (BSCS-6A)",
        email: "hassan.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-107",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Iqra Shahzad (BSCS-6A)",
        email: "iqra.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-108",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Junaid Khan (BSCS-6A)",
        email: "junaid.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-109",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Kiran Fatima (BSCS-6A)",
        email: "kiran.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-110",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Moiz Rehman (BSCS-6A)",
        email: "moiz.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-111",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Nida Yasir (BSCS-6A)",
        email: "nida.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-112",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Omer Farooq (BSCS-6A)",
        email: "omer.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-113",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Parvez Elahi (BSCS-6A)",
        email: "parvez.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-114",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },
      {
        name: "Qasim Zia (BSCS-6A)",
        email: "qasim.bscs6a@campusconnect.com",
        registeration_number: "2023F-bscs6a-115",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        semester: 6,
        program: "BSCS",
        section: "A",
      },

      // --- RIDERS (One for each restaurant) ---
      {
        name: "Savour Rider",
        email: "savour.rider@campusconnect.com",
        registeration_number: "2020F-mulrider-001",
        password: hashedPassword,
        role: "rider",
        department: "Campus Delivery",
        semester: 0,
        program: "Delivery Partner",
        section: "",
      },
      {
        name: "Gourmet Rider",
        email: "gourmet.rider@campusconnect.com",
        registeration_number: "2020F-mulrider-002",
        password: hashedPassword,
        role: "rider",
        department: "Campus Delivery",
        semester: 0,
        program: "Delivery Partner",
        section: "",
      },
      {
        name: "Johnny Rider",
        email: "johnny.rider@campusconnect.com",
        registeration_number: "2020F-mulrider-003",
        password: hashedPassword,
        role: "rider",
        department: "Campus Delivery",
        semester: 0,
        program: "Delivery Partner",
        section: "",
      },
      {
        name: "Dogar Rider",
        email: "dogar.rider@campusconnect.com",
        registeration_number: "2020F-mulrider-004",
        password: hashedPassword,
        role: "rider",
        department: "Campus Delivery",
        semester: 0,
        program: "Delivery Partner",
        section: "",
      },
    ];
    await User.insertMany(dummyUsers);
    console.log("✅ Dummy Users (including Riders) created successfully!");

    // --- VENDORS ---
    const dummyVendors = [
      {
        name: "Savour Vendor",
        email: "savour@campusconnect.com",
        registeration_number: "2020F-mulvendor-001",
        password: "password123",
        role: "vendor",
        restaurantName: "Savour Foods",
        phone: "+923001234560",
      },
      {
        name: "Gourmet Vendor",
        email: "gourmet@campusconnect.com",
        registeration_number: "2020F-mulvendor-002",
        password: "password123",
        role: "vendor",
        restaurantName: "Gourmet Restaurant",
        phone: "+923001234561",
      },
      {
        name: "Johnny Vendor",
        email: "johnny@campusconnect.com",
        registeration_number: "2020F-mulvendor-003",
        password: "password123",
        role: "vendor",
        restaurantName: "Johnny & Jugnu",
        phone: "+923001234562",
      },
      {
        name: "Dogar Vendor",
        email: "dogar@campusconnect.com",
        registeration_number: "2020F-mulvendor-004",
        password: "password123",
        role: "vendor",
        restaurantName: "Dogar Restaurant",
        phone: "+923001234563",
      },
    ];

    const seededVendors = [];
    for (const v of dummyVendors) {
      const vendor = await Vendor.create(v);
      seededVendors.push(vendor);
    }
    console.log("✅ 4 Dummy Vendors created successfully!");

    // --- RESTAURANTS ---
    const restaurantsData = [
      {
        name: "Savour Foods",
        ownerEmail: "savour@campusconnect.com",
        phone: "+923001234560",
        address: "Township Sector C, Lahore (2.8 km from MUL)",
        coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80",
        deliveryRadiusKm: 5,
        menu: [
          {
            name: "Chicken Pulao Kabab",
            price: 380,
            description: "Savour's legendary fragrant basmati rice served with two shami kababs and tender chicken piece.",
            image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Shami Kabab Platter",
            price: 150,
            description: "Two pieces of crispy, golden-brown chicken shami kababs served with raita.",
            image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Savour Chicken Roll",
            price: 220,
            description: "Crispy fried wrap filled with shredded chicken, mayo, and green chutney.",
            image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Crispy Fries",
            price: 130,
            description: "Classic salted crispy potato fries with tomato ketchup.",
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Cold Drink (345ml)",
            price: 90,
            description: "Chilled carbonated soft drink of your choice.",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Fresh Lime Soda",
            price: 140,
            description: "Fizzy club soda with freshly squeezed lime juice and simple syrup.",
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Savour Special Kheer",
            price: 180,
            description: "Traditional slow-cooked rice pudding flavored with cardamom and garnished with almonds.",
            image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&q=80",
            isAvailable: true
          }
        ]
      },
      {
        name: "Gourmet Restaurant",
        ownerEmail: "gourmet@campusconnect.com",
        phone: "+923001234561",
        address: "Main Boulevard Township, Lahore (1.5 km from MUL)",
        coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80",
        deliveryRadiusKm: 5,
        menu: [
          {
            name: "Gourmet Chicken Biryani",
            price: 300,
            description: "Aromatic basmati rice cooked with spicy chicken and traditional spices.",
            image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Chicken Karahi (Single)",
            price: 420,
            description: "Traditional wok-cooked chicken with tomatoes, green chilies, and aromatic spices.",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Club Sandwich",
            price: 280,
            description: "Gourmet's signature double-decker sandwich with chicken, egg, mayo, and lettuce.",
            image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Gourmet Chicken Burger",
            price: 240,
            description: "Soft bun containing a chicken patty, signature sauce, and fresh vegetables.",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Mango Shake",
            price: 220,
            description: "Thick, creamy blend of fresh sweet mangoes, milk, and vanilla ice cream.",
            image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Gourmet Mineral Water",
            price: 70,
            description: "Purified bottled drinking water.",
            image: "https://images.unsplash.com/photo-1608885898957-a599fb1b467a?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Gourmet Chocolate Pastry",
            price: 120,
            description: "Rich chocolate layer cake slice topped with fudge icing.",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Pineapple Cake Slice",
            price: 110,
            description: "Soft sponge cake layer with whipped cream and pineapple bits.",
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
            isAvailable: true
          }
        ]
      },
      {
        name: "Johnny & Jugnu",
        ownerEmail: "johnny@campusconnect.com",
        phone: "+923001234562",
        address: "Johar Town, Lahore (4.2 km from MUL)",
        coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
        deliveryRadiusKm: 5,
        menu: [
          {
            name: "Wehshi Burger",
            price: 390,
            description: "Johnny & Jugnu's famous crispy chicken fillet burger with Wehshi hot sauce.",
            image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Mushroom Wrap",
            price: 350,
            description: "Tortilla wrap filled with crispy chicken strips, creamy mushroom sauce, and cheese.",
            image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Pizza Fries",
            price: 290,
            description: "Crispy fries loaded with marinara sauce, diced chicken, melted mozzarella, and olives.",
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Chapli Kabab Burger",
            price: 260,
            description: "Fusion bun burger with a juicy, spiced beef chapli kabab patty.",
            image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Mint Margarita",
            price: 180,
            description: "Refreshing blend of fresh mint leaves, lime juice, soda, and crushed ice.",
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Soft Drink",
            price: 100,
            description: "Chilled canned soda.",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Hot Fudge Brownie",
            price: 200,
            description: "Rich, dense chocolate brownie served warm with chocolate syrup.",
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Nutella Waffle",
            price: 280,
            description: "Crispy waffle topped with generous Nutella spread and icing sugar.",
            image: "https://images.unsplash.com/photo-1562376502-6f769499c886?w=500&q=80",
            isAvailable: true
          }
        ]
      },
      {
        name: "Dogar Restaurant",
        ownerEmail: "dogar@campusconnect.com",
        phone: "+923001234563",
        address: "Main Market Township, Lahore (1.2 km from MUL)",
        coverImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
        deliveryRadiusKm: 5,
        menu: [
          {
            name: "Special Chicken Biryani",
            price: 320,
            description: "Lahori-style spicy chicken biryani with boiled egg and raita.",
            image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Seekh Kabab (2 Pcs)",
            price: 240,
            description: "Minced beef skewers spiced with herbs and grilled over charcoal.",
            image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Dogar Haleem",
            price: 220,
            description: "Slow-cooked stew of wheat, barley, meat, and lentils, served with lemon and ginger.",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Chicken Shawarma",
            price: 180,
            description: "Shaved spiced chicken wrapped in pita bread with garlic sauce and pickles.",
            image: "https://images.unsplash.com/photo-1662143494793-1b9136fe9f33?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Chicken Paratha Roll",
            price: 230,
            description: "Juicy chicken tikka boti rolled in a crispy, flaky golden paratha.",
            image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Doodh Patti Chai",
            price: 90,
            description: "Rich, strong Lahori tea brewed in pure milk.",
            image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Karak Chai",
            price: 110,
            description: "Spiced hot tea with cardamom and condensed milk.",
            image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Gulab Jamun (2 Pcs)",
            price: 130,
            description: "Warm, sweet milk-solid balls soaked in rose-flavored sugar syrup.",
            image: "https://images.unsplash.com/photo-1589135284962-d9f2d1591873?w=500&q=80",
            isAvailable: true
          },
          {
            name: "Ras Malai (2 Pcs)",
            price: 180,
            description: "Soft cottage cheese patties soaked in sweetened, saffron-infused milk.",
            image: "https://images.unsplash.com/photo-1589135284962-d9f2d1591873?w=500&q=80",
            isAvailable: true
          }
        ]
      }
    ];

    for (const r of restaurantsData) {
      const vendor = seededVendors.find(v => v.email === r.ownerEmail);
      if (vendor) {
        await Restaurant.create({
          name: r.name,
          owner: vendor._id,
          phone: r.phone,
          address: r.address,
          coverImage: r.coverImage,
          deliveryRadiusKm: r.deliveryRadiusKm,
          menu: r.menu,
          isActive: true
        });
      }
    }
    console.log("✅ 4 Dummy Restaurants seeded successfully!");

    // --- CAREER THREADS SEEDING ---
    const alumniJaveria = await User.findOne({ email: "javeria@alumni.com" });
    const alumniAzam = await User.findOne({ email: "azam@alumni.com" });
    const studentHamza = await User.findOne({ email: "hamza@student.com" });
    const studentZoya = await User.findOne({ email: "zoya@student.com" });

    const dummyCareerThreads = [
      {
        title: "Junior Frontend Engineer (React) – Systems Limited",
        content: "Systems Limited is hiring Junior Frontend Engineers for our Lahore office. Candidates with strong React, JavaScript, and Tailwind CSS skills are encouraged to apply. Great tech stack and mentorship for fresh graduates!",
        category: "job_opportunity",
        location: "Lahore, Pakistan",
        jobType: "Full-time",
        qualification: "BSCS / Software Engineering",
        company: "Systems Limited",
        companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80",
        author: alumniJaveria ? alumniJaveria._id : studentHamza._id,
        likesCount: 24,
        viewsCount: 145,
        replies: [
          {
            author: studentHamza ? studentHamza._id : alumniAzam._id,
            content: "Is this position open for fresh 2026 graduates? I have built 3 full-stack MERN projects.",
          },
          {
            author: alumniJaveria ? alumniJaveria._id : studentHamza._id,
            content: "Yes! Fresh graduates with good portfolio projects are warmly welcomed to apply.",
          },
        ],
      },
      {
        title: "Which tech stack & skills are most in demand for 2026 CS graduates?",
        content: "Let's discuss the most in-demand tech stack and roadmap for next year. What are top software houses looking for in fresh CS graduates? AI integration, MERN, or Cloud DevOps?",
        category: "general_discussion",
        author: studentHamza ? studentHamza._id : alumniAzam._id,
        likesCount: 31,
        viewsCount: 210,
        replies: [
          {
            author: alumniAzam ? alumniAzam._id : studentHamza._id,
            content: "Strong problem solving with DSA + solid fundamentals in Node/React or Python AI libraries will make you stand out easily.",
          },
        ],
      },
      {
        title: "Software Engineering Internship Opportunity – Techlogix",
        content: "Techlogix is offering 3-month paid summer software engineering internships for CS/IT undergraduates. Work on real enterprise web apps and cloud services. Apply before 31st July.",
        category: "internship",
        location: "Lahore, Pakistan",
        jobType: "Paid Internship",
        qualification: "BSCS / 3rd or 4th Year",
        company: "Techlogix",
        companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
        author: alumniAzam ? alumniAzam._id : studentHamza._id,
        likesCount: 19,
        viewsCount: 128,
        replies: [
          {
            author: studentZoya ? studentZoya._id : studentHamza._id,
            content: "Thank you for sharing! Just submitted my resume.",
          },
        ],
      },
      {
        title: "How to prepare for Technical System Design & DSA Interviews?",
        content: "Looking for top recommended courses, books, and practice problems to prepare for technical coding interviews and System Design rounds. Please share your suggestions!",
        category: "mentorship_qa",
        author: studentZoya ? studentZoya._id : studentHamza._id,
        likesCount: 14,
        viewsCount: 98,
        replies: [
          {
            author: alumniJaveria ? alumniJaveria._id : studentHamza._id,
            content: "Start with LeetCode Mediums on Trees, Graphs, and Dynamic Programming. For System Design, check out ByteByteGo on YouTube!",
          },
        ],
      },
    ];

    await CareerThread.insertMany(dummyCareerThreads);
    console.log("✅ 4 Dummy Career Threads seeded successfully!");

    // --- FORUM THREADS SEEDING ---
    const modShujaatUser = await User.findOne({ email: "shujaat@mod.com" });
    const modUsamaUser = await User.findOne({ email: "usama@mod.com" });
    const studentBilalUser = await User.findOne({ email: "bilal@student.com" });
    const studentFatimaUser = await User.findOne({ email: "fatima@student.com" });
    const studentAliUser = await User.findOne({ email: "ali@student.com" });

    const modShujaat = modShujaatUser ? modShujaatUser._id : studentHamza._id;
    const modUsama = modUsamaUser ? modUsamaUser._id : studentHamza._id;
    const studentBilal = studentBilalUser ? studentBilalUser._id : studentHamza._id;
    const studentFatima = studentFatimaUser ? studentFatimaUser._id : studentHamza._id;
    const studentAli = studentAliUser ? studentAliUser._id : studentHamza._id;

    const dummyForumThreads = [
      {
        title: "Final Year Project (FYP) Ideas & Domain Guidance for 2026 Batch",
        content: "Assalam-o-Alaikum everyone! As semester progress continues, many 6th and 7th semester students are looking for FYP ideas in AI, Full-Stack Web, Mobile Apps, and IoT. What domain is your team focusing on? Let's discuss supervisor approvals and tech stack choices.",
        category: "Academics",
        tags: ["FYP", "BSCS", "SoftwareEngSociety"],
        author: modShujaat._id,
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
        repliesCount: 3,
        replies: [
          {
            author: studentHamza._id,
            content: "Our team is working on an AI-powered Student Resume & Skill Matcher. Getting data and API access configured!",
            image: ""
          },
          {
            author: studentFatima._id,
            content: "We are building an automated attendance system using OpenCV facial recognition. Can seniors suggest good references?",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80"
          },
          {
            author: modShujaat._id,
            content: "Facial recognition is a solid choice! Just make sure to handle lighting edge-cases in campus corridors.",
            image: ""
          }
        ]
      },
      {
        title: "Best Midterm Preparation Strategies & Daily Study Group in Central Library",
        content: "Midterms are starting next week! How is everyone pacing their revision? For Data Structures & Algorithms, practicing past papers and tracing recursion trees on whiteboards helps a lot. We are forming a daily study group in the Central Library floor 2 after 2 PM.",
        category: "Academics",
        tags: ["Midterms", "StudyGroup", "BSSE"],
        author: studentFatima._id,
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        repliesCount: 3,
        replies: [
          {
            author: studentBilal._id,
            content: "Count me in! DSA dry-running on whiteboards is a game changer for binary search trees.",
            image: ""
          },
          {
            author: studentZoya._id,
            content: "Can someone share solved notes for Operating Systems CPU Scheduling algorithms?",
            image: ""
          },
          {
            author: studentHamza._id,
            content: "I uploaded OS CPU scheduling notes and Gantt chart examples to the shared drive folder!",
            image: ""
          }
        ]
      },
      {
        title: "Campus Wi-Fi Upgrade & Extended Library Hours for Midterm Week",
        content: "Great news! The IT Department has expanded 5GHz Wi-Fi coverage across Block B and student study halls. Also, library hours are being extended till 8:00 PM during midterm week so students can study comfortably.",
        category: "Campus Life",
        tags: ["CampusWifi", "LibraryHours", "BSIT"],
        author: studentHamza._id,
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
        repliesCount: 2,
        replies: [
          {
            author: studentAli._id,
            content: "Awesome update! The Wi-Fi speed in the library study lounge is super fast now.",
            image: ""
          },
          {
            author: modUsama._id,
            content: "Thanks to the IT department for addressing student feedback so quickly!",
            image: ""
          }
        ]
      },
      {
        title: "Hands-on Workshop: Introduction to Machine Learning & Python Pandas",
        content: "The Data Science Student Society is hosting a hands-on workshop on Python, Pandas, and Scikit-Learn this Thursday at 11:30 AM in CS Lab 3. Beginners are warmly welcome! Bring your laptops with Anaconda installed.",
        category: "Tech Hub",
        tags: ["DataScienceSociety", "BSDS", "Assignments"],
        author: studentZoya._id,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
        repliesCount: 2,
        replies: [
          {
            author: studentAli._id,
            content: "Will certificates of participation be provided?",
            image: ""
          },
          {
            author: studentZoya._id,
            content: "Yes! Digital certificates will be issued to all registered attendees.",
            image: ""
          }
        ]
      },
      {
        title: "Cyber Security Club: CTF (Capture The Flag) Competition Registration",
        content: "Calling all ethical hackers and security enthusiasts! CampusConnect Cyber Club is launching the annual Intra-University CTF Competition next month. Challenges cover Web Security, Cryptography, Reverse Engineering, and Forensics.",
        category: "Tech Hub",
        tags: ["CyberSecurityClub", "BSCYBER", "Finals"],
        author: studentBilal._id,
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        repliesCount: 2,
        replies: [
          {
            author: alumniAzam._id,
            content: "This sounds exciting! Wish we had CTF competitions back when I was a junior.",
            image: ""
          },
          {
            author: studentBilal._id,
            content: "Alumni members are welcome to join as judges and mentors!",
            image: ""
          }
        ]
      },
      {
        title: "Annual Campus Sports & Cultural Week – Registrations Now Open!",
        content: "The annual university Sports & Cultural Festival is scheduled for next month! Tournaments include Cricket, Futsal, Badminton, Table Tennis, and E-Sports (PUBG & Valorant). Register your department teams before Friday!",
        category: "Campus Life",
        tags: ["SportsClub", "Events", "Community"],
        author: modUsama._id,
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
        repliesCount: 3,
        replies: [
          {
            author: studentAli._id,
            content: "BSCS Futsal team registration form submitted!",
            image: ""
          },
          {
            author: studentFatima._id,
            content: "Is there a female Badminton single/doubles tournament as well?",
            image: ""
          },
          {
            author: modUsama._id,
            content: "Yes! Female sports tournaments take place in the Indoor Girls Gymnasium.",
            image: ""
          }
        ]
      },
      {
        title: "Alumni Panel Q&A: Preparing for Software Engineering & Industry Roles",
        content: "Hello students! As an alumna working in software development, I am opening a thread to answer any questions about tech resumes, coding interviews, software engineering internships, or transitioning from university to corporate jobs. Ask away!",
        category: "Q & A",
        tags: ["Advice", "BSCS", "BSSE"],
        author: alumniJaveria._id,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        repliesCount: 3,
        replies: [
          {
            author: studentHamza._id,
            content: "How important are LeetCode / competitive programming problems compared to building real full-stack web apps?",
            image: ""
          },
          {
            author: alumniJaveria._id,
            content: "Both matter! LeetCode builds problem-solving speed for screening rounds, while full-stack projects prove you can build real products.",
            image: ""
          },
          {
            author: studentZoya._id,
            content: "Thank you Javeria Api for guiding us!",
            image: ""
          }
        ]
      },
      {
        title: "Campus Library Digital Research Portal & IEEE Access Guide",
        content: "Did you know all students have free access to digital IEEE research papers and ACM digital library through the university portal? Check out the research section under your student portal login.",
        category: "Academics",
        tags: ["LibraryHours", "StudyGroup"],
        author: studentFatima._id,
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
        repliesCount: 1,
        replies: [
          {
            author: modShujaat._id,
            content: "Great reminder! Super helpful for final year students writing research reports.",
            image: ""
          }
        ]
      },
      {
        title: "Campus Canteen Food Quality & Healthy Meal Recommendations",
        content: "What are your top recommended meals at the university canteen? Share your favorite healthy lunch options and fruit smoothies available on campus!",
        category: "Campus Life",
        tags: ["CanteenFeedback", "Community"],
        author: studentAli._id,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        repliesCount: 1,
        replies: [
          {
            author: studentHamza._id,
            content: "The fresh fruit salad bowl at Savour Canteen is amazing!",
            image: ""
          }
        ]
      },
      {
        title: "Software Engineering Society Membership Drive 2026",
        content: "The Software Engineering Society is inviting new members for the 2026 executive team! Domains include Web Dev, Event Management, Content Writing, and Design.",
        category: "Tech Hub",
        tags: ["SoftwareEngSociety", "Events"],
        author: studentFatima._id,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        repliesCount: 1,
        replies: [
          {
            author: studentZoya._id,
            content: "Form submitted! Looking forward to joining the design team.",
            image: ""
          }
        ]
      },
      {
        title: "How to Prepare for Technical Presentation & Slides Defense",
        content: "Got an upcoming semester project presentation? Here are quick tips for structuring your slides: 1. Keep text minimal, 2. Focus on architecture diagrams, 3. Live demo > 20 slides.",
        category: "Academics",
        tags: ["Midterms", "Advice"],
        author: modShujaat._id,
        image: "",
        repliesCount: 1,
        replies: [
          {
            author: studentBilal._id,
            content: "Spot on! Live demos always leave a great impression on evaluators.",
            image: ""
          }
        ]
      },
      {
        title: "Mobile App Development: Flutter vs React Native in 2026",
        content: "Planning your next mobile app project? Let me know whether you prefer Flutter (Dart) or React Native (JS/TS) for cross-platform app performance.",
        category: "Tech Hub",
        tags: ["BSCS", "SoftwareEngSociety"],
        author: studentHamza._id,
        image: "",
        repliesCount: 1,
        replies: [
          {
            author: studentAli._id,
            content: "React Native is super convenient if you already know React.js!",
            image: ""
          }
        ]
      }
    ];

    await Forum.insertMany(dummyForumThreads);
    console.log("✅ 12 Rich Academic & University Forum Threads with replies seeded successfully!");

    // --- PETITIONS SEEDING ---
    const classStudentAhmad = await User.findOne({ email: "ahmad.bscs6a@campusconnect.com" });
    const classStudentAyesha = await User.findOne({ email: "ayesha.bscs6a@campusconnect.com" });
    const studentHamzaCS = await User.findOne({ email: "hamza@student.com" });

    const dummyPetitions = [
      {
        title: "Extend FYP Proposal Submission Deadline for BSCS 6th Semester",
        description: "We respectfully request a 1-week extension for submitting the Final Year Project (FYP) initial proposals due to overlapping midterm lab evaluations and project presentations.",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
        creator: classStudentAhmad ? classStudentAhmad._id : studentHamzaCS._id,
        level: "Class",
        targetGroup: "BSCS-Computer Science-6-A",
        signatures: classStudentAhmad ? [classStudentAhmad._id, classStudentAyesha._id] : [],
        milestone: 15,
        status: "Active",
      },
      {
        title: "Request for Dedicated Hands-on MERN Stack Practice Lab Slot (BSCS-6A)",
        description: "Our class requests a 2-hour supplementary lab slot every Thursday in Lab 3 to practice MERN stack deployment, Docker containerization, and API integrations.",
        image: "",
        creator: classStudentAyesha ? classStudentAyesha._id : studentHamzaCS._id,
        level: "Class",
        targetGroup: "BSCS-Computer Science-6-A",
        signatures: classStudentAyesha ? [classStudentAyesha._id] : [],
        milestone: 12,
        status: "Active",
      },
      {
        title: "Upgrade High-Performance GPU Workstations in Computer Science Labs",
        description: "The Computer Science department labs require GPU accelerator upgrades (NVIDIA RTX series) to support deep learning, computer vision, and AI coursework for senior students.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        creator: studentHamzaCS ? studentHamzaCS._id : classStudentAhmad._id,
        level: "Department",
        targetGroup: "Computer Science",
        signatures: studentHamzaCS ? [studentHamzaCS._id] : [],
        milestone: 50,
        status: "Active",
      },
      {
        title: "Install Solar Shuttle Charging Hubs & Eco-Friendly Campus Transit",
        description: "Proposing zero-emission electric shuttle carts and solar power stations across university blocks to assist students and staff commuting between distant departments.",
        image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
        creator: studentHamzaCS ? studentHamzaCS._id : classStudentAhmad._id,
        level: "Campus",
        targetGroup: "Campus",
        signatures: studentHamzaCS ? [studentHamzaCS._id] : [],
        milestone: 100,
        status: "Active",
      },
    ];

    await Petition.insertMany(dummyPetitions);
    console.log("✅ Class, Department, and Campus Petitions seeded successfully!");

    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.stack || error.message}`);
    process.exit(1);
  }
};
seedUsers();
