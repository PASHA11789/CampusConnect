import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './src/models/User.js';

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Update all CS students and moderators
    const studentUpdateResult = await User.updateMany(
      {
        role: { $in: ['student', 'student_mod'] },
        $or: [
          { department: 'Computer Science & IT' },
          { department: 'Computer Science' },
          { department: '' },
          { registeration_number: { $regex: /bscs|cs/i } }
        ]
      },
      {
        $set: {
          department: 'BS Computer Science',
          program: 'BS Programs'
        }
      }
    );
    console.log('Updated CS Students/Mods:', studentUpdateResult);

    // 2. Clear academic fields for alumni and campus admins
    const adminUpdateResult = await User.updateMany(
      { role: { $in: ['campus_admin', 'alumni'] } },
      {
        $set: {
          department: '',
          program: '',
          semester: 0,
          section: ''
        }
      }
    );
    console.log('Updated Alumni/Admins:', adminUpdateResult);

    // 3. Print all updated records
    const users = await User.find(
      {},
      'name email registeration_number role department program semester section'
    ).lean();

    console.log('\nAll users in database:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.registeration_number}) | Role: ${u.role} | Dept: "${u.department}" | Prog: "${u.program}" | Sem: ${u.semester}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error updating users:', err);
    process.exit(1);
  }
}

updateUsers();
