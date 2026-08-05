import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Restaurant from "./src/models/Restaurants.js";

dotenv.config();

const mcdonaldsMenuItems = [
  // 🍗 Chicken & Fish
  {
    name: "Spicy Crispy Deluxe",
    price: 646.56,
    category: "Chicken & Fish",
    description: "A favorite local staple featuring a crispy, spicy chicken thigh fillet with fresh lettuce and mayo on a corn-dusted bun.",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&q=80",
    isAvailable: true
  },
  {
    name: "McChicken",
    price: 517.25,
    category: "Chicken & Fish",
    description: "The classic breaded chicken patty topped with crisp lettuce and creamy mayonnaise on a toasted bun.",
    image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Chicken Mac",
    price: 663.80,
    category: "Chicken & Fish",
    description: "A chicken version of the Big Mac, featuring two breaded chicken patties, cheese, lettuce, pickles, and special sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Grand Chicken Special",
    price: 1034.49,
    category: "Chicken & Fish",
    description: "A premium, thick crispy chicken patty layered with fresh veggies, cheese, and special sauces.",
    image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Filet-O-Fish",
    price: 707.00,
    category: "Chicken & Fish",
    description: "A classic breaded fish fillet patty paired with tangy tartar sauce and a half-slice of cheese on a steamed bun.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80",
    isAvailable: true
  },

  // 🍔 Beef Burgers
  {
    name: "Big Mac",
    price: 974.14,
    category: "Beef Burgers",
    description: "The iconic burger featuring two 100% pure beef patties, signature Big Mac sauce, lettuce, cheese, pickles, and onions on a sesame seed bun.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Quarter Pounder with Cheese",
    price: 974.14,
    category: "Beef Burgers",
    description: "A classic, thick quarter-pound beef patty topped with two slices of cheese, slivered onions, and pickles.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Double Cheeseburger",
    price: 750.00,
    category: "Beef Burgers",
    description: "Two 100% beef patties layered with two slices of American cheese, topped with mustard, ketchup, pickles, and onions.",
    image: "https://images.unsplash.com/photo-1534790566855-4cc788479725?w=600&q=80",
    isAvailable: true
  },
  {
    name: "McRoyale",
    price: 990.00,
    category: "Beef Burgers",
    description: "A premium, juicy beef burger served with fresh lettuce, tomato, cheese, and creamy mayonnaise.",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80",
    isAvailable: true
  },

  // 🌯 Wraps & Specialties
  {
    name: "McArabia",
    price: 1103.45,
    category: "Wraps & Specialties",
    description: "A Middle Eastern and South Asian favorite featuring two grilled chicken patties wrapped in soft Arabic pita bread with lettuce, tomatoes, and garlic mayo sauce.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Crispy Chicken Wraps",
    price: 650.00,
    category: "Wraps & Specialties",
    description: "Crispy chicken tenders wrapped in a soft tortilla, available with flavorful sauces like Chipotle or BBQ, along with fresh veggies.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    isAvailable: true
  },

  // 🍟 Sides & Snacks
  {
    name: "World Famous Fries - Large",
    price: 431.04,
    category: "Sides & Snacks",
    description: "McDonald's signature golden, crispy French fries, perfectly salted.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Chicken McNuggets - 6 pc",
    price: 560.36,
    category: "Sides & Snacks",
    description: "Bite-sized, crispy tempura-battered chicken breast pieces with dipping sauces.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80",
    isAvailable: true
  },

  // 🍦 Desserts
  {
    name: "McFlurry KitKat",
    price: 625.00,
    category: "Desserts",
    description: "Creamy soft serve ice cream blended with crushed KitKat crumbles.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Sundaes",
    price: 350.00,
    category: "Desserts",
    description: "Classic vanilla soft serve generously topped with your choice of Hot Fudge, Strawberry, or Caramel syrup.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Apple Pie",
    price: 280.00,
    category: "Desserts",
    description: "A hot, crispy, and flaky pastry pocket filled with sweet, cinnamon-spiced apple filling.",
    image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80",
    isAvailable: true
  },

  // ☕ McCafé & Beverages
  {
    name: "Frappé - 16oz Vanilla",
    price: 828.00,
    category: "McCafé & Beverages",
    description: "Rich, blended iced beverages available in indulgent flavors.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
    isAvailable: true
  },
  {
    name: "Soft Drinks / Iced Coffees & Teas",
    price: 250.00,
    category: "McCafé & Beverages",
    description: "Refreshing cold drinks including Coca-Cola, Iced Lattes, Iced Americanos, and fruit-flavored Iced Teas.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80",
    isAvailable: true
  }
];

const updateMcDonaldsMenu = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://shujaapasha11789_db_user:98cjp2ru9@ac-ve0ctfj-shard-00-00.smkbsxu.mongodb.net:27017,ac-ve0ctfj-shard-00-01.smkbsxu.mongodb.net:27017,ac-ve0ctfj-shard-00-02.smkbsxu.mongodb.net:27017/CampusConnect?ssl=true&replicaSet=atlas-qrmidp-shard-0&authSource=admin&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("📡 Connected to MongoDB...");

    let vendor = await Vendor.findOne({
      $or: [{ name: /mcdonald/i }, { restaurantName: /mcdonald/i }, { registeration_number: "2020F-mcdonalds-001" }]
    });

    if (!vendor) {
      console.log("Creating McDonald's vendor account...");
      vendor = await Vendor.create({
        name: "Mc Donalds",
        email: "mcdonalds@campusconnect.com",
        restaurantName: "Mc Donalds",
        phone: "0300-1234567",
        registeration_number: "2020F-mcdonalds-001",
        password: "password123",
        avatar: "http://localhost:3000/mcdonalds.svg"
      });
    }

    let restaurant = await Restaurant.findOne({ owner: vendor._id });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: "Mc Donalds",
        owner: vendor._id,
        phone: "0300-1234567",
        address: "Block A, Minhaj University Campus Lahore",
        coverImage: "http://localhost:3000/mcdonalds.svg",
        deliveryRadiusKm: 7,
        isActive: true,
        menu: mcdonaldsMenuItems
      });
      console.log("✅ McDonald's restaurant profile created!");
    } else {
      restaurant.menu = mcdonaldsMenuItems;
      restaurant.coverImage = "http://localhost:3000/mcdonalds.svg";
      restaurant.isActive = true;
      await restaurant.save();
      console.log(`✅ Updated McDonald's menu in MongoDB with ${mcdonaldsMenuItems.length} updated items & prices!`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating McDonald's menu:", err);
    process.exit(1);
  }
};

updateMcDonaldsMenu();
