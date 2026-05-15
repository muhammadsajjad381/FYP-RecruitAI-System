const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // process.exit(1); // Debugging ke liye exit nahi kar rahe
  }
};

module.exports = connectDB;
