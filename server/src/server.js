import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Smart Bhavnagar API Server running on port ${config.port}`);
    console.log(`📡 Base API URL: http://localhost:${config.port}/api/v1`);
    console.log(`❤️  Health Check: http://localhost:${config.port}/api/v1/health`);
    console.log(`=======================================================`);
  });
};

startServer();
