/**
 * Seed script — creates demo users in the database.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  await connectDB();

  const demos = [
    { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin', department: 'IT' },
    { name: 'Agent Smith', email: 'agent@demo.com', password: 'password123', role: 'agent', department: 'Support' },
    { name: 'John User', email: 'user@demo.com', password: 'password123', role: 'user', department: 'General' },
  ];

  for (const u of demos) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`✅ Created: ${u.email} (${u.role})`);
    } else {
      console.log(`⚠️  Already exists: ${u.email}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('Admin:  admin@demo.com  / password123');
  console.log('Agent:  agent@demo.com  / password123');
  console.log('User:   user@demo.com   / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
