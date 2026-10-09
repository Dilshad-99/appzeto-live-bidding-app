import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initSocket } from './services/socketService.js';
import { startAuctionScheduler } from './services/auctionScheduler.js';

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  // Initialize WebSockets
  initSocket(server);

  // Start background auction state transitions (SCHEDULED -> LIVE, LIVE -> CLOSED/SETTLED)
  startAuctionScheduler(2000);

  server.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Auction Backend API running on port ${config.port}`);
    console.log(`🔗 Health check: http://localhost:${config.port}/api/health`);
    console.log(`======================================================\n`);
  });
};

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
