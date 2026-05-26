import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

import { seedDB } from './config/seeder.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database
connectDB().then(async () => {
  await seedDB();
  server.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\n❌ Port ${PORT} is already in use. Stop the other process or run: npm run fresh\n`
      );
      process.exit(1);
    }
    throw err;
  });
}).catch(err => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
