const express = require('express');
const router = express.Router();

const TicketController = require('../controllers/TicketController');
const ticketValidators = require('../validators/ticketValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /tickets
 * @desc    Get all tickets with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  ticketValidators.getTickets,
  handleValidationErrors,
  protect,
  TicketController.getTickets
);

/**
 * @route   POST /tickets
 * @desc    Create a new ticket
 * @access  Private
 */
router.post(
  '/',
  ticketValidators.createTicket,
  handleValidationErrors,
  protect,
  TicketController.createTicket
);

/**
 * @route   GET /tickets/stats
 * @desc    Get ticket statistics
 * @access  Private
 */
router.get(
  '/stats',
  protect,
  TicketController.getTicketStats
);

/**
 * @route   GET /tickets/queue/next
 * @desc    Get next ticket for agent from their priority queue
 * @access  Private (Agents only)
 */
router.get(
  '/queue/next',
  protect,
  authorize('agent'),
  TicketController.getNextTicket
);

/**
 * @route   GET /tickets/queue/agent/:agentId?
 * @desc    Get agent's queue status
 * @access  Private (Agents only)
 */
router.get(
  '/queue/agent/:agentId?',
  protect,
  authorize('agent'),
  TicketController.getAgentQueue
);

/**
 * @route   GET /tickets/queue/system/stats
 * @desc    Get system-wide queue statistics
 * @access  Private (Super Agents only)
 */
router.get(
  '/queue/system/stats',
  protect,
  authorize('agent'),
  TicketController.getSystemQueueStats
);

/**
 * @route   GET /tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get(
  '/:id',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  TicketController.getTicketById
);

/**
 * @route   PUT /tickets/:id
 * @desc    Update ticket
 * @access  Private
 */
router.put(
  '/:id',
  ticketValidators.updateTicket,
  handleValidationErrors,
  protect,
  TicketController.updateTicket
);

/**
 * @route   PUT /tickets/:id/assign
 * @desc    Assign ticket to agent
 * @access  Private (Agents only)
 */
router.put(
  '/:id/assign',
  ticketValidators.assignTicket,
  handleValidationErrors,
  protect,
  authorize('agent'),
  TicketController.assignTicket
);

/**
 * @route   PATCH /tickets/:id/complete
 * @desc    Complete ticket and remove from queue
 * @access  Private (Agents only)
 */
router.patch(
  '/:id/complete',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  authorize('agent'),
  TicketController.completeTicket
);

/**
 * @route   DELETE /tickets/:id
 * @desc    Delete ticket
 * @access  Private (Owner or Super Agent only)
 */
router.delete(
  '/:id',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  TicketController.deleteTicket
);

module.exports = router;