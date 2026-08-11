import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './src/models/User.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email registeration_number role').lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
