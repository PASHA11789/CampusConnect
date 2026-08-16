import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`DB connection successful: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB connection error: ", error.message);
    console.log("Retrying DB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

