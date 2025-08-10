const { Ticket, Customer, Agent, Category, Comment, Attachment } = require('../models');
const TicketService = require('../services/TicketService');
const { successResponse, errorResponse, createdResponse } = require('../utils/response');
const { Op } = require('sequelize');

class TicketController {
  //This function is used to create a new ticket
  static async createTicket(req, res) {
    try {
      const { title, description, priority, categoryId } = req.body;
      const user = req.user;

      const ticketData = {
        title,
        description,
        priority: priority || 'medium',
        status: 'open',
        categoryId: categoryId || null
      };

      // Set customer ID based on user role
      if (user.role === 'customer') {
        ticketData.customerId = user.id;
      } else {
        // If agent creates ticket, they need to specify customer
        const { customerId } = req.body;
        if (!customerId) {
          return errorResponse(res, 'Customer ID is required when agent creates ticket', 'Customer ID is required when agent creates ticket', 400);
        }
        ticketData.customerId = customerId;
      }

      // Use the new queue-based ticket creation
      const result = await TicketService.createTicketWithQueueProcessing(ticketData);

      const responseData = {
        ticket: result.ticket,
        assignedAgent: result.assignedAgent,
        queueStats: result.queueStats,
        message: result.assignedAgent 
          ? `Ticket created and assigned to ${result.assignedAgent.name}`
          : 'Ticket created and added to pending queue'
      };

      createdResponse(res, responseData, 'Ticket created successfully');
    } catch (error) {
      console.error('Create ticket error:', error);
      errorResponse(res, 'Failed to create ticket', 'Failed to create ticket', 500);
    }
  }

  //This function is used to get all tickets with filtering and pagination
  static async getTickets(req, res) {
    try {
      const user = req.user;
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        category,
        assignedTo,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {};
      
      // Role-based filtering
      if (user.role === 'customer') {
        whereClause.customerId = user.id;
      }

      // Apply filters
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
      if (category) {
        // If category is a string (name), we need to find the category ID first
        if (isNaN(category)) {
          const categoryRecord = await Category.findOne({ 
            where: { name: category, isActive: true } 
          });
          if (categoryRecord) {
            whereClause.categoryId = categoryRecord.id;
          }
        } else {
          whereClause.categoryId = parseInt(category);
        }
      }
      if (assignedTo) whereClause.assignedTo = assignedTo;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const tickets = await TicketService.getTicketsPaginated({
        where: whereClause,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });

      successResponse(res, tickets, 'Tickets retrieved successfully');
    } catch (error) {
      console.error('Get tickets error:', error);
      errorResponse(res, 'Failed to retrieve tickets', 'Failed to retrieve tickets', 500);
    }
  }

  //This function is used to get a ticket by its id
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const ticket = await TicketService.getTicketById(id);
      if (!ticket) {
        return errorResponse(res, 'Ticket not found', 'Ticket not found', 404);
      }

      // Check access permissions
      if (user.role === 'customer' && ticket.customerId !== user.id) {
        return errorResponse(res, 'Access denied to this ticket', 'Access denied to this ticket', 403);
      }

      successResponse(res, { ticket }, 'Ticket retrieved successfully');
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      errorResponse(res, 'Failed to retrieve ticket', 'Failed to retrieve ticket', 500);
    }
  }

  //This function is used to update a ticket
  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return errorResponse(res, 'Ticket not found', 'Ticket not found', 404);
      }

      // Check permissions
      if (user.role === 'customer') {
        if (ticket.customerId !== user.id) {
          return errorResponse(res, 'Access denied to this ticket', 'Access denied to this ticket', 403);
        }
        // Customers can only update certain fields
        const allowedFields = ['title', 'description'];
        const customerUpdate = {};
        allowedFields.forEach(field => {
          if (updateData[field] !== undefined) {
            customerUpdate[field] = updateData[field];
          }
        });
        updateData = customerUpdate;
      }

      // Handle status updates with timestamps
      if (updateData.status) {
        if (updateData.status === 'resolved' && ticket.status !== 'resolved') {
          updateData.resolvedAt = new Date();
        }
        if (updateData.status === 'closed' && ticket.status !== 'closed') {
          updateData.closedAt = new Date();
        }
      }

      await ticket.update(updateData);

      // Fetch updated ticket with associations
      const updatedTicket = await TicketService.getTicketById(id);

      successResponse(res, { ticket: updatedTicket }, 'Ticket updated successfully');
    } catch (error) {
      console.error('Update ticket error:', error);
      errorResponse(res, 'Failed to update ticket', 'Failed to update ticket', 500);
    }
  }

  //This function is used to assign a ticket to an agent
  static async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { agentId } = req.body;
      const user = req.user;

      // Only agents can assign tickets
      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can assign tickets', 'Only agents can assign tickets', 403);
      }

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return errorResponse(res, 'Ticket not found', 'Ticket not found', 404);
      }

      // Verify agent exists
      if (agentId) {
        const agent = await Agent.findByPk(agentId);
        if (!agent) {
          return errorResponse(res, 'Agent not found', 'Agent not found', 404);
        }
      }

      await ticket.update({ 
        assignedTo: agentId,
        status: agentId ? 'in_progress' : 'open'
      });

      const updatedTicket = await TicketService.getTicketById(id);

      successResponse(res, { ticket: updatedTicket }, 'Ticket assignment updated successfully');
    } catch (error) {
      console.error('Assign ticket error:', error);
      errorResponse(res, 'Failed to assign ticket', 'Failed to assign ticket', 500);
    }
  }

  //This function is used to delete a ticket
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return errorResponse(res, 'Ticket not found', 'Ticket not found', 404);
      }

      // Only allow deletion by the customer who created it or super agents
      if (user.role === 'customer' && ticket.customerId !== user.id) {
        return errorResponse(res, 'Access denied to delete this ticket', 'Access denied to delete this ticket', 403);
      }

      if (user.role === 'agent' && !user.isSuperAgent) {
        return errorResponse(res, 'Only super agents can delete tickets', 'Only super agents can delete tickets', 403);
      }

      await ticket.destroy();

      successResponse(res, 'Ticket deleted successfully', 'Ticket deleted successfully');
    } catch (error) {
      console.error('Delete ticket error:', error);
      errorResponse(res, 'Failed to delete ticket', 'Failed to delete ticket', 500);
    }
  }

  //This function is used to get the statistics of a ticket
  static async getTicketStats(req, res) {
    try {
      const user = req.user;

      const whereClause = {};
      if (user.role === 'customer') {
        whereClause.customerId = user.id;
      }

      const stats = await TicketService.getTicketStatistics(whereClause);

      successResponse(res, { stats }, 'Ticket statistics retrieved successfully');
    } catch (error) {
      console.error('Get ticket stats error:', error);
      errorResponse(res, 'Failed to retrieve ticket statistics', 'Failed to retrieve ticket statistics', 500);
    }
  }

  //This function gets the next ticket for an agent from their priority queue
  static async getNextTicket(req, res) {
    try {
      const user = req.user;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can access their queue', 'Only agents can access their queue', 403);
      }

      const nextTicket = await TicketService.getNextTicketForAgent(user.id);

      if (!nextTicket) {
        return successResponse(res, { nextTicket: null }, 'No tickets in queue');
      }

      successResponse(res, { nextTicket }, 'Next ticket retrieved successfully');
    } catch (error) {
      console.error('Get next ticket error:', error);
      errorResponse(res, 'Failed to retrieve next ticket', 'Failed to retrieve next ticket', 500);
    }
  }

  //This function gets agent's queue status
  static async getAgentQueue(req, res) {
    try {
      const user = req.user;
      const { agentId } = req.params;

      // Agents can only see their own queue, super agents can see any queue
      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can access queue information', 'Only agents can access queue information', 403);
      }

      const targetAgentId = agentId || user.id;

      if (!user.isSuperAgent && parseInt(targetAgentId) !== user.id) {
        return errorResponse(res, 'Access denied to this agent queue', 'Access denied to this agent queue', 403);
      }

      const queueInfo = TicketService.getAgentQueueInfo(targetAgentId);

      successResponse(res, { queueInfo }, 'Agent queue information retrieved successfully');
    } catch (error) {
      console.error('Get agent queue error:', error);
      errorResponse(res, 'Failed to retrieve agent queue', 'Failed to retrieve agent queue', 500);
    }
  }

  //This function gets system-wide queue statistics (super agents only)
  static async getSystemQueueStats(req, res) {
    try {
      const user = req.user;

      if (user.role !== 'agent' || !user.isSuperAgent) {
        return errorResponse(res, 'Only super agents can access system queue statistics', 'Only super agents can access system queue statistics', 403);
      }

      const systemStats = TicketService.getSystemQueueStatistics();

      successResponse(res, { systemStats }, 'System queue statistics retrieved successfully');
    } catch (error) {
      console.error('Get system queue stats error:', error);
      errorResponse(res, 'Failed to retrieve system queue statistics', 'Failed to retrieve system queue statistics', 500);
    }
  }

  //This function completes a ticket and removes it from queue
  static async completeTicket(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { status = 'resolved' } = req.body;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can complete tickets', 'Only agents can complete tickets', 403);
      }

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return errorResponse(res, 'Ticket not found', 'Ticket not found', 404);
      }

      // Check if agent is assigned to this ticket
      if (ticket.assignedTo !== user.id) {
        return errorResponse(res, 'You can only complete tickets assigned to you', 'You can only complete tickets assigned to you', 403);
      }

      const updatedTicket = await TicketService.completeTicket(id, { status });

      successResponse(res, { ticket: updatedTicket }, 'Ticket completed successfully');
    } catch (error) {
      console.error('Complete ticket error:', error);
      errorResponse(res, 'Failed to complete ticket', 'Failed to complete ticket', 500);
    }
  }
}

module.exports = TicketController;