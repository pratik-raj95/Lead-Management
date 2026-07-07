import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import apiRoutes from './routes/apiRoutes.js';

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
    // Allow requests with no origin (like mobile apps, webhook alerts, or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in whitelist or CORS_ORIGIN is set to '*'
    const envOrigin = process.env.CORS_ORIGIN;
    if (allowedOrigins.indexOf(origin) !== -1 || envOrigin === '*' || !envOrigin) {
      return callback(null, true);
    }
    
    // Check for exact environment match
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
