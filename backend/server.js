import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { logger } from './middleware/logger.js';
import apiRoutes from './routes/apiRoutes.js';
import { initGoogleSheets } from './config/googleSheets.js';

// Natively load environment variables on Node 22+
try {
  if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
    console.log('[Env Loader] Loaded properties from backend/.env.');
  }
} catch (err) {
  console.warn('[Env Loader Warning] Skip reading .env file:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with dynamic origin matching for development and production safety
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lead-management-crm.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const envOrigin = process.env.CORS_ORIGIN;
    if (allowedOrigins.indexOf(origin) !== -1 || envOrigin === '*' || !envOrigin) {
      return callback(null, true);
    }
    if (origin === envOrigin) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use(logger);

// Mount API routes with /api prefix
app.use('/api', apiRoutes);

// Start the server using async block to await Google Sheets authorization
(async () => {
  try {
    // Force Google Sheets API validation on boot
    await initGoogleSheets();

    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`CRM Backend running on http://localhost:${PORT}`);
      console.log(`Webhook Endpoint: http://localhost:${PORT}/api/webhook`);
      console.log(`=============================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`=============================================`);
        console.error(`CRITICAL ERROR: Port ${PORT} is already in use!`);
        console.error(`=============================================`);
        process.exit(1);
      } else {
        console.error('Server encountered an error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error(`=============================================`);
    console.error(`CRITICAL STARTUP ERROR: ${err.message}`);
    console.error(`=============================================`);
    process.exit(1);
  }
})();
