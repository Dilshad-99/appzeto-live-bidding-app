import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_platform?replicaSet=rs0&directConnection=true',
  jwtSecret: process.env.JWT_SECRET || 'appzeto_super_secret_jwt_key_2026_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  antiSnipingThresholdSeconds: parseInt(process.env.ANTI_SNIPING_THRESHOLD_SECONDS || '120', 10), // 2 mins
  antiSnipingExtensionSeconds: parseInt(process.env.ANTI_SNIPING_EXTENSION_SECONDS || '120', 10), // 2 mins
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
