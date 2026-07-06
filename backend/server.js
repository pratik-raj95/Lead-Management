import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with configurable origins for production safety
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use(logger);

// Mount API routes with /api prefix
app.use('/api', apiRoutes);

// Start the server on process.env.PORT or 5000
const server = app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`CRM Backend running on http://localhost:${PORT}`);
  console.log(`Webhook Endpoint: http://localhost:${PORT}/api/webhook`);
  console.log(`=============================================`);
});

// Handle server errors (such as port collisions) in a standard production-ready fail-fast manner
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`=============================================`);
    console.error(`CRITICAL ERROR: Port ${PORT} is already in use!`);
    console.error(`Please check if another instance of the CRM backend is already running.`);
    console.error(`To run on a different port, set the PORT environment variable (e.g. PORT=5001 npm start).`);
    console.error(`=============================================`);
    process.exit(1);
  } else {
    console.error('Server encountered an error:', err);
    process.exit(1);
  }
});
