import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Forum from "./src/models/Forum.js";
import Petition from "./src/models/Petition.js";
import Restaurant from "./src/models/Restaurants.js";
import Order from "./src/models/Order.js";
import CareerThread from "./src/models/CareerThread.js";
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
    ];
    await User.insertMany(dummyUsers);
    console.log("✅ Dummy Users created successfully!");

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

    console.log("📡 Skipping forum threads and petitions seeding to focus on restaurants.");
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.stack || error.message}`);
    process.exit(1);
  }
};
seedUsers();
