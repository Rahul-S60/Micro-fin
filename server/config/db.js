/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 * Implements connection pooling and error handling
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

/**
 * Disconnect from MongoDB
 * @async
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB Disconnected');
  } catch (error) {
    console.error(`✗ MongoDB Disconnection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
