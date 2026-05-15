const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected...');

    const email = 'ahmar12@gmail.com';
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'Admin' },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`Successfully promoted ${email} to Admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
