const { Ticket, Customer, Agent, Category, Comment, Attachment, sequelize } = require('../models');
const { Op } = require('sequelize');
const TicketQueueService = require('./TicketQueueService');

class TicketService {
  /**
   * Get ticket by ID with all associations
   * @param {number} ticketId - Ticket ID
   * @returns {object|null} Ticket with associations or null
   */
  static async getTicketById(ticketId) {
    try {
      return await Ticket.findByPk(ticketId, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'company']
          },
          {
            model: Agent,
            as: 'assignedAgent',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Category,
            as: 'ticketCategory',
            attributes: ['id', 'name', 'description', 'color', 'isActive']
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'content', 'isInternal', 'createdAt', 'userId'],
            order: [['createdAt', 'ASC']]
          },
          {
            model: Attachment,
            as: 'attachments',
            attributes: ['id', 'filename', 'originalName', 'mimeType', 'fileSize', 'createdAt']
          }
        ]
      });
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      throw error;
    }
  }

  /**
   * Get tickets with pagination and filtering
   * @param {object} options - Query options
   * @returns {object} Paginated tickets result
   */
  static async getTicketsPaginated(options) {
    try {
      const {
        where = {},
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;

      const { count, rows } = await Ticket.findAndCountAll({
        where,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'company']
          },
          {
            model: Agent,
            as: 'assignedAgent',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Category,
            as: 'ticketCategory',
            attributes: ['id', 'name', 'description', 'color', 'isActive']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true // Important for accurate count with includes
      });

      return {
        tickets: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Get tickets paginated error:', error);
      throw error;
    }
  }

  /**
   * Get ticket statistics
   * @param {object} whereClause - Where conditions
   * @returns {object} Statistics object
   */
  static async getTicketStatistics(whereClause = {}) {
    try {
      const [
        totalTickets,
        statusStats,
        priorityStats,
        recentTickets,
        averageResolutionTime
      ] = await Promise.all([
        // Total tickets count
        Ticket.count({ where: whereClause }),

        // Status distribution
        Ticket.findAll({
          where: whereClause,
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        }),

        // Priority distribution
        Ticket.findAll({
          where: whereClause,
          attributes: [
            'priority',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['priority'],
          raw: true
        }),

        // Recent tickets (last 7 days)
        Ticket.count({
          where: {
            ...whereClause,
            createdAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Average resolution time (in hours)
        Ticket.findAll({
          where: {
            ...whereClause,
            resolvedAt: { [Op.not]: null }
          },
          attributes: [
            [
              sequelize.fn(
                'AVG',
                sequelize.literal('EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600')
              ),
              'avgHours'
            ]
          ],
          raw: true
        })
      ]);

      return {
        totalTickets,
        statusDistribution: statusStats.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        priorityDistribution: priorityStats.reduce((acc, item) => {
          acc[item.priority] = parseInt(item.count);
          return acc;
        }, {}),
        recentTickets,
        averageResolutionTimeHours: averageResolutionTime[0]?.avgHours 
          ? parseFloat(averageResolutionTime[0].avgHours).toFixed(2)
          : null
      };
    } catch (error) {
      console.error('Get ticket statistics error:', error);
      throw error;
    }
  }

  /**
   * Search tickets by keyword
   * @param {string} keyword - Search keyword
   * @param {object} options - Additional search options
   * @returns {Array} Array of matching tickets
   */
  static async searchTickets(keyword, options = {}) {
    try {
      const { userRole, userId, limit = 20 } = options;

      const whereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } }
        ]
      };

      // Add role-based filtering
      if (userRole === 'customer') {
        whereClause.customerId = userId;
      }

      return await Ticket.findAll({
        where: whereClause,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Agent,
            as: 'assignedAgent',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Category,
            as: 'ticketCategory',
            attributes: ['id', 'name', 'description', 'color', 'isActive']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });
    } catch (error) {
      console.error('Search tickets error:', error);
      throw error;
    }
  }

  /**
   * Get tickets assigned to a specific agent
   * @param {number} agentId - Agent ID
   * @param {object} options - Query options
   * @returns {Array} Array of assigned tickets
   */
  static async getAgentTickets(agentId, options = {}) {
    try {
      const { status, limit = 50 } = options;

      const whereClause = { assignedTo: agentId };
      if (status) {
        whereClause.status = status;
      }

      return await Ticket.findAll({
        where: whereClause,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'company']
          },
          {
            model: Category,
            as: 'ticketCategory',
            attributes: ['id', 'name', 'description', 'color', 'isActive']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });
    } catch (error) {
      console.error('Get agent tickets error:', error);
      throw error;
    }
  }

  /**
   * Update ticket priority based on keywords or rules
   * @param {object} ticket - Ticket object
   * @returns {string} Suggested priority
   */
  static determinePriorityFromContent(ticket) {
    const { title, description } = ticket;
    const content = `${title} ${description}`.toLowerCase();

    const urgentKeywords = ['urgent', 'critical', 'emergency', 'down', 'broken', 'asap'];
    const highKeywords = ['important', 'priority', 'issue', 'problem', 'bug'];
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'urgent';
    }
    
    if (highKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Get overdue tickets
   * @param {object} whereClause - Additional where conditions
   * @returns {Array} Array of overdue tickets
   */
  static async getOverdueTickets(whereClause = {}) {
    try {
      return await Ticket.findAll({
        where: {
          ...whereClause,
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ['resolved', 'closed'] }
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Agent,
            as: 'assignedAgent',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Category,
            as: 'ticketCategory',
            attributes: ['id', 'name', 'description', 'color', 'isActive']
          }
        ],
        order: [['dueDate', 'ASC']]
      });
    } catch (error) {
      console.error('Get overdue tickets error:', error);
      throw error;
    }
  }

  /**
   * Create a new ticket and process through queue system
   * @param {object} ticketData - Ticket creation data
   * @returns {object} Created ticket with assigned agent info
   */
  static async createTicketWithQueueProcessing(ticketData) {
    try {
      const transaction = await sequelize.transaction();

      try {
        // Create the ticket
        const ticket = await Ticket.create(ticketData, { transaction });

        // Process through queue system for automatic assignment
        const assignedAgent = await TicketQueueService.processNewTicket(ticket);

        await transaction.commit();

        // Fetch ticket with all associations
        const ticketWithDetails = await this.getTicketById(ticket.id);

        return {
          ticket: ticketWithDetails,
          assignedAgent,
          queueStats: assignedAgent ? TicketQueueService.getAgentQueueStatus(assignedAgent.id) : null
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Create ticket with queue processing error:', error);
      throw error;
    }
  }

  /**
   * Get next ticket for agent from their priority queue
   * @param {number} agentId - Agent ID
   * @returns {object|null} Next ticket or null if queue empty
   */
  static async getNextTicketForAgent(agentId) {
    try {
      const nextTicket = TicketQueueService.getNextTicketForAgent(agentId);
      
      if (nextTicket) {
        // Fetch full ticket details
        const ticketDetails = await this.getTicketById(nextTicket.ticketId);
        return {
          ...ticketDetails,
          queueInfo: {
            priority: nextTicket.priority,
            queueEnteredAt: nextTicket.queueEnteredAt
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Get next ticket for agent error:', error);
      throw error;
    }
  }

  /**
   * Complete ticket and remove from queue
   * @param {number} ticketId - Ticket ID
   * @param {object} updateData - Ticket update data
   * @returns {object} Updated ticket
   */
  static async completeTicket(ticketId, updateData = {}) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const agentId = ticket.assignedTo;

      // Update ticket status
      const completeData = {
        ...updateData,
        status: updateData.status || 'resolved',
        resolvedAt: updateData.status === 'resolved' ? new Date() : updateData.resolvedAt,
        closedAt: updateData.status === 'closed' ? new Date() : updateData.closedAt
      };

      await ticket.update(completeData);

      // Remove from agent's queue if assigned
      if (agentId) {
        TicketQueueService.removeTicketFromQueue(ticketId, agentId);
      }

      return await this.getTicketById(ticketId);
    } catch (error) {
      console.error('Complete ticket error:', error);
      throw error;
    }
  }

  /**
   * Get agent's queue status and tickets
   * @param {number} agentId - Agent ID
   * @returns {object} Agent queue information
   */
  static getAgentQueueInfo(agentId) {
    try {
      return {
        queueStatus: TicketQueueService.getAgentQueueStatus(agentId),
        nextTicket: TicketQueueService.getNextTicketForAgent(agentId)
      };
    } catch (error) {
      console.error('Get agent queue info error:', error);
      throw error;
    }
  }

  /**
   * Subscribe agent to categories
   * @param {number} agentId - Agent ID
   * @param {Array} categoryIds - Array of category IDs
   */
  static async subscribeAgentToCategories(agentId, categoryIds) {
    try {
      const results = [];
      
      for (const categoryId of categoryIds) {
        await TicketQueueService.subscribeAgentToCategory(agentId, categoryId);
        results.push({ agentId, categoryId, status: 'subscribed' });
      }

      return results;
    } catch (error) {
      console.error('Subscribe agent to categories error:', error);
      throw error;
    }
  }

  /**
   * Get system-wide queue statistics
   * @returns {object} System queue stats
   */
  static getSystemQueueStatistics() {
    try {
      return TicketQueueService.getSystemQueueStats();
    } catch (error) {
      console.error('Get system queue statistics error:', error);
      throw error;
    }
  }
}

module.exports = TicketService;