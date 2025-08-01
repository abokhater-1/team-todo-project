const mongoose = require('mongoose');
const path = require('path');
const User = require('server/models/user');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug: Print connection string
console.log('🔍 MONGO_URI =', process.env.MONGO_URI);

async function insertUsers() {
  try {
    // ✅ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 🧹 Optional: Clear existing users
    await User.deleteMany();

    // ➕ Insert sample users
    await User.insertMany([
      {
        name: 'Marwan',
        email: 'marwan@mail.com',
        password: '123',
        role: 'manager'
      },
      {
        name: 'Wissam',
        email: 'wissam@mail.com',
        password: '123',
        role: 'employee'
      }
    ]);

    console.log('✅ Users inserted successfully');
  } catch (err) {
    console.error('❌ Error inserting users:', err);
  } finally {
    mongoose.connection.close();
  }
}

insertUsers();
