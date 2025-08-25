const express = require('express');
const router = express.Router();

const AgentController = require('../controllers/AgentController');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');

//This route is used to create a new agent
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('categoryIds').optional().isArray().withMessage('Category IDs must be an array')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  AgentController.createAgent
);

//This route is used to get all agents
router.get(
  '/',
  protect,
  authorize('agent'),
  AgentController.getAgents
);

//This route is used to get an agent by id
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid agent ID is required')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  AgentController.getAgentById
);

//This route is used to subscribe an agent to categories
router.post(
  '/:agentId/categories',
  [
    param('agentId').isInt({ min: 1 }).withMessage('Valid agent ID is required'),
    body('categoryIds').isArray({ min: 1 }).withMessage('At least one category ID is required'),
    body('categoryIds.*').isInt({ min: 1 }).withMessage('Valid category IDs are required')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  AgentController.subscribeToCategories
);

//This route is used to unsubscribe an agent from categories
router.delete(
  '/:agentId/categories',
  [
    param('agentId').isInt({ min: 1 }).withMessage('Valid agent ID is required'),
    body('categoryIds').isArray({ min: 1 }).withMessage('At least one category ID is required'),
    body('categoryIds.*').isInt({ min: 1 }).withMessage('Valid category IDs are required')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  AgentController.unsubscribeFromCategories
);

//This route is used to update an agent's status
router.patch(
  '/:agentId/status',
  [
    param('agentId').isInt({ min: 1 }).withMessage('Valid agent ID is required'),
    body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Status must be active, inactive, or suspended')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  AgentController.updateAgentStatus
);

module.exports = router;