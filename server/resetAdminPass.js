import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function resetPass() {
  await mongoose.connect(process.env.MONGO_URI);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  await User.updateMany(
    { role: 'campus_admin' },
    { $set: { password: hash } }
  );

  console.log('All campus_admin accounts have had their password reset to: password123');
  const admins = await User.find({ role: 'campus_admin' }, 'name registeration_number email role');
  console.log(admins);
  process.exit(0);
}

resetPass();
