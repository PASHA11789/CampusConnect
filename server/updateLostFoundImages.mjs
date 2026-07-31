// Directly updates all LostFound items to add realistic Unsplash images via MongoDB
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const imageMap = {
  "Electronics":     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  "Books & Notes":   "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80",
  "Accessories":     "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  "Clothing":        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
  "Keys & Cards":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "Others":          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
};

// Override specific items with more accurate images
const specificImages = {
  "Samsung Galaxy S23 Ultra": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
  "Blue Steel Water Bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
  "Data Structures Notebook": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
  "Car Keys with BMW Keychain": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "AirPods Pro 2nd Gen": "https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=600&q=80",
  "Black NASA Hoodie Medium": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
  "Prescription Glasses Brown Case": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80",
  "Leather Wallet with CS Student ID": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
  "MacBook Pro USB-C Charger 67W": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
  "Organic Chemistry Textbook": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  "Red Quechua Backpack": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  "Student ID Card BSSE": "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=600&q=80",
};

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const collection = db.collection("lostfounds");

  const items = await collection.find({ image: { $in: ["", null] } }).toArray();
  console.log(`Found ${items.length} items without images\n`);

  let updated = 0;
  for (const item of items) {
    const imageUrl =
      specificImages[item.itemName] ||
      imageMap[item.category] ||
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80";

    await collection.updateOne(
      { _id: item._id },
      { $set: { image: imageUrl } }
    );
    console.log(`Updated: ${item.itemName} => ${imageUrl}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} items with images.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
