const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const categoryRoutes = require('./categories');
const userRoutes = require('./users');
const agentRoutes = require('./agents');

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/agents', agentRoutes);

// API Documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'FeathersUp Ticketing System API',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register/customer': 'Register new customer',
        'POST /api/auth/register/agent': 'Register new agent (agents only)',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/logout': 'Logout user'
      },
      tickets: {
        'GET /api/tickets': 'Get tickets with filtering',
        'POST /api/tickets': 'Create new ticket (auto-assigned via queue)',
        'GET /api/tickets/stats': 'Get ticket statistics',
        'GET /api/tickets/queue/next': 'Get next ticket from agent queue',
        'GET /api/tickets/queue/agent/:id': 'Get agent queue status',
        'GET /api/tickets/queue/system/stats': 'Get system queue statistics',
        'GET /api/tickets/:id': 'Get ticket by ID',
        'PUT /api/tickets/:id': 'Update ticket',
        'PUT /api/tickets/:id/assign': 'Assign ticket to agent',
        'PATCH /api/tickets/:id/complete': 'Complete ticket and remove from queue',
        'DELETE /api/tickets/:id': 'Delete ticket'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'POST /api/categories': 'Create category (agents only)',
        'PUT /api/categories/:id': 'Update category (agents only)',
        'DELETE /api/categories/:id': 'Delete category (super agents only)'
      },
      users: {
        'GET /api/users/customers': 'Get customers (agents only)',
        'GET /api/users/agents': 'Get agents (super agents only)',
        'GET /api/users/customers/:id': 'Get customer by ID (agents only)',
        'PUT /api/users/customers/:id/status': 'Update customer status (agents only)'
      },
      agents: {
        'POST /api/agents': 'Create new agent (super agents only)',
        'GET /api/agents': 'Get all agents',
        'GET /api/agents/:id': 'Get agent by ID',
        'POST /api/agents/:id/categories': 'Subscribe agent to categories',
        'DELETE /api/agents/:id/categories': 'Unsubscribe agent from categories',
        'PATCH /api/agents/:id/status': 'Update agent status (super agents only)'
      }
    },
    documentation: 'API endpoints follow RESTful conventions',
    support: 'admin@feathersup.com'
  });
});

module.exports = router; 