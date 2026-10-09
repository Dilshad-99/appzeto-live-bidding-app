import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Fallback if replicaSet query param fails on standalone mode
    if (config.mongoUri.includes('replicaSet')) {
      const fallbackUri = 'mongodb://127.0.0.1:27017/auction_platform';
      console.log(`[MongoDB] Attempting fallback connection: ${fallbackUri}`);
      try {
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[MongoDB] Fallback connected: ${conn.connection.host}`);
        return conn;
      } catch (err2) {
        console.error(`[MongoDB Error] Fallback failed: ${err2.message}`);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};
