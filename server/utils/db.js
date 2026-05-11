import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DB connection sucessful`);
  } catch (error) {
    console.log("DB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
