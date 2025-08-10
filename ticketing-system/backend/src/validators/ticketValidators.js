const { body, query, param } = require('express-validator');

const ticketValidators = {
  /**
   * Validation rules for creating a ticket
   */
  createTicket: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters')
      .notEmpty()
      .withMessage('Title is required'),

    body('description')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Description must be between 10 and 5000 characters')
      .notEmpty()
      .withMessage('Description is required'),

    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, medium, high, urgent'),

    body('categoryId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),

    body('customerId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ],

  /**
   * Validation rules for updating a ticket
   */
  updateTicket: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Ticket ID must be a positive integer'),

    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),

    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Description must be between 10 and 5000 characters'),

    body('status')
      .optional()
      .isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled'])
      .withMessage('Status must be one of: open, in_progress, resolved, closed, cancelled'),

    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, medium, high, urgent'),

    body('assignedTo')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer'),

    body('categoryId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),

    body('estimatedHours')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Estimated hours must be between 0 and 999.99'),

    body('actualHours')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Actual hours must be between 0 and 999.99'),

    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),

    body('internalNotes')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Internal notes cannot exceed 5000 characters')
  ],

  /**
   * Validation rules for assigning tickets
   */
  assignTicket: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Ticket ID must be a positive integer'),

    body('agentId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Agent ID must be a positive integer')
  ],

  /**
   * Validation rules for getting tickets with query parameters
   */
  getTickets: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('status')
      .optional()
      .isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled'])
      .withMessage('Status must be one of: open, in_progress, resolved, closed, cancelled'),

    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, medium, high, urgent'),

    query('category')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category must be a positive integer'),

    query('assignedTo')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer'),

    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),

    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'title', 'status', 'priority'])
      .withMessage('Sort by must be one of: createdAt, updatedAt, title, status, priority'),

    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be either ASC or DESC')
  ],

  /**
   * Validation rules for ticket ID parameter
   */
  ticketId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Ticket ID must be a positive integer')
  ]
};

module.exports = ticketValidators;