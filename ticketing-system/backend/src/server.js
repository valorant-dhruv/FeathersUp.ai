const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { runAllSeeders } = require('./seeders');
const TicketQueueService = require('./services/TicketQueueService');

const app = express();
const PORT = process.env.PORT || 3000;

//Helmet is a middleware that helps to secure the application by setting various HTTP headers.
app.use(helmet());

// CORS configuration to allow requests from different domains
//CORS allows to specify the URLs that are allowed to access the application.
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', `http://localhost:${PORT}`],
  credentials: true
}));

//Rate limiting to prevent abuse of the API
//Rate limiting is a middleware that limits the number of requests from an IP address.
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'FeathersUp Ticketing System API',
    status: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      docs: '/api'
    }
  });
});

// Use custom error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: '/api'
  });
});

// Start server
const startServer = async () => {
  try {
    //Testing the connection to the database
    await testConnection();
    
    // Sync database models
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: true }); // This will drop and recreate all tables
    console.log('✅ Database models synced successfully!');
    
    // Run seeders to populate initial data
    console.log('🌱 Running database seeders...');
    await runAllSeeders();
    console.log('✅ Database seeding completed!');
    
    // Initialize ticket queue service
    console.log('🎯 Initializing ticket queue service...');
    await TicketQueueService.loadAgentQueues();
    console.log('✅ Ticket queue service initialized!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('🎯 Pub/Sub ticket queue system is active!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 