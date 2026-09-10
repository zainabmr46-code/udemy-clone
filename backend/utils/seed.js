// Run with: npm run seed
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const run = async () => {
  await connectDB();

  const categories = ['Web Development', 'Design', 'AI & Machine Learning', 'Business', 'Marketing', 'Photography'];
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await Category.updateOne({ slug }, { name, slug }, { upsert: true });
  }
  console.log(`Seeded ${categories.length} categories`);

  const adminEmail = 'admin@udemyclone.dev';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin',
    });
    console.log(`Seeded admin user -> ${adminEmail} / Admin@12345 (change this password!)`);
  } else {
    console.log('Admin user already exists, skipping');
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
