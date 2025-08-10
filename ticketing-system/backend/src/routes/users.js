const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');

const { Customer, Agent } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * @route   GET /users/customers
 * @desc    Get all customers (agents only)
 * @access  Private (Agents only)
 */
router.get(
  '/customers',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),
    
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status
      } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { company: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Customer.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const customers = {
        customers: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      };

      successResponse(res, customers, 'Customers retrieved successfully');
    } catch (error) {
      console.error('Get customers error:', error);
      errorResponse(res, error, 'Failed to retrieve customers', 500);
    }
  }
);

/**
 * @route   GET /users/agents
 * @desc    Get all agents (super agents only)
 * @access  Private (Super Agents only)
 */
router.get(
  '/agents',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),
    
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      // Only super agents can view other agents
      if (!req.user.isSuperAgent) {
        return errorResponse(res, null, 'Only super agents can view agent list', 403);
      }

      const {
        page = 1,
        limit = 20,
        search,
        status
      } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Agent.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const agents = {
        agents: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      };

      successResponse(res, agents, 'Agents retrieved successfully');
    } catch (error) {
      console.error('Get agents error:', error);
      errorResponse(res, error, 'Failed to retrieve agents', 500);
    }
  }
);

/**
 * @route   GET /users/customers/:id
 * @desc    Get customer by ID (agents only)
 * @access  Private (Agents only)
 */
router.get(
  '/customers/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await Customer.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: require('../models').Ticket,
            as: 'tickets',
            attributes: ['id', 'title', 'status', 'priority', 'createdAt']
          }
        ]
      });

      if (!customer) {
        return errorResponse(res, null, 'Customer not found', 404);
      }

      successResponse(res, { customer }, 'Customer retrieved successfully');
    } catch (error) {
      console.error('Get customer by ID error:', error);
      errorResponse(res, error, 'Failed to retrieve customer', 500);
    }
  }
);

/**
 * @route   PUT /users/customers/:id/status
 * @desc    Update customer status (agents only)
 * @access  Private (Agents only)
 */
router.put(
  '/customers/:id/status',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('status')
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return errorResponse(res, null, 'Customer not found', 404);
      }

      await customer.update({ status });

      successResponse(res, { 
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          status: customer.status
        }
      }, 'Customer status updated successfully');
    } catch (error) {
      console.error('Update customer status error:', error);
      errorResponse(res, error, 'Failed to update customer status', 500);
    }
  }
);

module.exports = router;