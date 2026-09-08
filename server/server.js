require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput, apiLimiter } = require('./middleware/security');

// Feature-specific route handlers
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Disable X-Powered-By to prevent technology fingerprinting
app.disable('x-powered-by');

// Standard security HTTP headers (configured to allow cross-origin assets for dev & frontend)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing with strict credentials policy
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Limit request body payload size to protect against body buffer exhaustion
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Strip MongoDB operator injection keys ($ and .) across body, query, and route params
app.use(sanitizeInput);

// Lightweight health check endpoint for container orchestrators and monitoring probes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TeamPulse API service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Protect all API routes with global request rate limiting
app.use('/api', apiLimiter);

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let serverInstance = null;

if (process.env.NODE_ENV !== 'test') {
  require('./config/auth').getJwtSecret();
  connectDB().then(async () => {
    // Auto-seed if database has no users (first boot or in-memory)
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0 && process.env.AUTO_SEED === 'true' && process.env.NODE_ENV !== 'production') {
      console.log('Database is empty. Automatically running demo seed...');
      const seedDatabase = require('./seed/seedData');
      await seedDatabase();
    }

    serverInstance = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` TeamPulse Server running!               `);
      console.log(` Port: http://localhost:${PORT}          `);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exitCode = 1;
  });
}

if (process.env.NODE_ENV !== 'test') {
  const shutdown = async () => { if(serverInstance) serverInstance.close(); await disconnectDB(); };
  process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
}
module.exports = app;
