const express = require('express');
const router = express.Router();

const TicketController = require('../controllers/TicketController');
const ticketValidators = require('../validators/ticketValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

//This route is used to get all tickets with filtering and pagination
router.get(
  '/',
  ticketValidators.getTickets,
  handleValidationErrors,
  protect,
  TicketController.getTickets
);

//This route is used to create a new ticket
router.post(
  '/',
  ticketValidators.createTicket,
  handleValidationErrors,
  protect,
  TicketController.createTicket
);

//This route is used to get ticket statistics
router.get(
  '/stats',
  protect,
  TicketController.getTicketStats
);

//This route is used to get the next ticket for an agent from their priority queue
router.get(
  '/queue/next',
  protect,
  authorize('agent'),
  TicketController.getNextTicket
);

//This route is used to get an agent's queue status
router.get(
  '/queue/agent/:agentId?',
  protect,
  authorize('agent'),
  TicketController.getAgentQueue
);

//This route is used to get system-wide queue statistics
router.get(
  '/queue/system/stats',
  protect,
  authorize('agent'),
  TicketController.getSystemQueueStats
);

//This route is used to get a ticket by id
router.get(
  '/:id',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  TicketController.getTicketById
);

//This route is used to update a ticket
router.put(
  '/:id',
  ticketValidators.updateTicket,
  handleValidationErrors,
  protect,
  TicketController.updateTicket
);

//This route is used to assign a ticket to an agent
router.put(
  '/:id/assign',
  ticketValidators.assignTicket,
  handleValidationErrors,
  protect,
  authorize('agent'),
  TicketController.assignTicket
);

//This route is used to complete a ticket and remove it from the queue
router.patch(
  '/:id/complete',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  authorize('agent'),
  TicketController.completeTicket
);

//This route is used to delete a ticket
router.delete(
  '/:id',
  ticketValidators.ticketId,
  handleValidationErrors,
  protect,
  TicketController.deleteTicket
);

module.exports = router;