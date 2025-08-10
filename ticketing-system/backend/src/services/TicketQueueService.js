const { Ticket, Agent, Category, AgentCategory, sequelize } = require('../models');
const { Op } = require('sequelize');
const EventEmitter = require('events');

class TicketQueueService extends EventEmitter {
  constructor() {
    super();
    // Initialize in-memory priority queues for each agent
    this.agentQueues = new Map();
    this.categorySubscribers = new Map();
    this.loadAgentQueues();
  }

  /**
   * Initialize agent queues and category subscriptions
   */
  async loadAgentQueues() {
    try {
      const agents = await Agent.findAll({
        where: { status: 'active' },
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }]
      });

      agents.forEach(agent => {
        // Initialize priority queues for each agent
        this.agentQueues.set(agent.id, {
          urgent: [],
          high: [],
          medium: [],
          low: []
        });

        // Map categories to subscribed agents
        agent.subscribedCategories.forEach(category => {
          if (!this.categorySubscribers.has(category.id)) {
            this.categorySubscribers.set(category.id, []);
          }
          this.categorySubscribers.get(category.id).push(agent.id);
        });
      });

      console.log('Agent queues and category subscriptions loaded successfully');
    } catch (error) {
      console.error('Error loading agent queues:', error);
      throw error;
    }
  }

  /**
   * Add a ticket to the appropriate category queue and assign to best agent
   * @param {object} ticket - Ticket object with priority and categoryId
   */
  async processNewTicket(ticket) {
    try {
      const categoryId = ticket.categoryId;
      
      if (!categoryId) {
        console.warn(`Ticket ${ticket.id} has no category, assigning to general pool`);
        return await this.assignToGeneralPool(ticket);
      }

      // Get agents subscribed to this category
      const subscribedAgents = this.categorySubscribers.get(categoryId) || [];
      
      if (subscribedAgents.length === 0) {
        console.warn(`No agents subscribed to category ${categoryId}, assigning to general pool`);
        return await this.assignToGeneralPool(ticket);
      }

      // Find agent with least tickets among subscribers
      const bestAgent = await this.findAgentWithLeastTickets(subscribedAgents);
      
      if (!bestAgent) {
        console.warn('No available agents found, adding to pending queue');
        return await this.addToPendingQueue(ticket);
      }

      // Assign ticket to agent and add to their priority queue
      await this.assignTicketToAgent(ticket, bestAgent.id);

      this.emit('ticketAssigned', {
        ticketId: ticket.id,
        agentId: bestAgent.id,
        priority: ticket.priority,
        categoryId: categoryId
      });

      return bestAgent;
    } catch (error) {
      console.error('Error processing new ticket:', error);
      throw error;
    }
  }

  /**
   * Find agent with least number of active tickets from a list of agents
   * @param {Array} agentIds - Array of agent IDs to consider
   * @returns {object|null} Agent with least tickets
   */
  async findAgentWithLeastTickets(agentIds) {
    try {
      const agentTicketCounts = await Promise.all(
        agentIds.map(async (agentId) => {
          const count = await Ticket.count({
            where: {
              assignedTo: agentId,
              status: { [Op.notIn]: ['resolved', 'closed', 'cancelled'] }
            }
          });
          return { agentId, count };
        })
      );

      // Sort by ticket count (ascending) and return agent with least tickets
      const sortedAgents = agentTicketCounts.sort((a, b) => a.count - b.count);
      
      if (sortedAgents.length === 0) return null;

      const agentId = sortedAgents[0].agentId;
      return await Agent.findByPk(agentId);
    } catch (error) {
      console.error('Error finding agent with least tickets:', error);
      throw error;
    }
  }

  /**
   * Assign ticket to agent and add to their priority queue
   * @param {object} ticket - Ticket object
   * @param {number} agentId - Agent ID
   */
  async assignTicketToAgent(ticket, agentId) {
    try {
      const transaction = await sequelize.transaction();

      try {
        // Update ticket in database
        await ticket.update({
          assignedTo: agentId,
          status: 'in_progress',
          assignedAt: new Date(),
          queueEnteredAt: new Date()
        }, { transaction });

        // Add to agent's priority queue in memory
        const agentQueue = this.agentQueues.get(agentId);
        if (agentQueue) {
          const priorityQueue = this.getPriorityQueueName(ticket.priority);
          agentQueue[priorityQueue].push({
            ticketId: ticket.id,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            queueEnteredAt: new Date()
          });

          // Sort queue by timestamp (FIFO within same priority)
          agentQueue[priorityQueue].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error assigning ticket to agent:', error);
      throw error;
    }
  }

  /**
   * Get the next ticket for an agent based on priority and timestamp
   * @param {number} agentId - Agent ID
   * @returns {object|null} Next ticket to work on
   */
  getNextTicketForAgent(agentId) {
    const agentQueue = this.agentQueues.get(agentId);
    if (!agentQueue) return null;

    // Check queues in priority order: urgent -> high -> medium -> low
    const priorities = ['urgent', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const queue = agentQueue[priority];
      if (queue.length > 0) {
        return queue.shift(); // Remove and return first ticket (FIFO)
      }
    }

    return null;
  }

  /**
   * Get agent's queue status
   * @param {number} agentId - Agent ID
   * @returns {object} Queue status with counts per priority
   */
  getAgentQueueStatus(agentId) {
    const agentQueue = this.agentQueues.get(agentId);
    if (!agentQueue) return null;

    return {
      urgent: agentQueue.urgent.length,
      high: agentQueue.high.length,
      medium: agentQueue.medium.length,
      low: agentQueue.low.length,
      total: agentQueue.urgent.length + agentQueue.high.length + 
             agentQueue.medium.length + agentQueue.low.length
    };
  }

  /**
   * Subscribe agent to a category
   * @param {number} agentId - Agent ID
   * @param {number} categoryId - Category ID
   */
  async subscribeAgentToCategory(agentId, categoryId) {
    try {
      // Add to database
      await AgentCategory.findOrCreate({
        where: { agentId, categoryId }
      });

      // Update in-memory cache
      if (!this.categorySubscribers.has(categoryId)) {
        this.categorySubscribers.set(categoryId, []);
      }
      
      const subscribers = this.categorySubscribers.get(categoryId);
      if (!subscribers.includes(agentId)) {
        subscribers.push(agentId);
      }

      // Initialize agent queue if not exists
      if (!this.agentQueues.has(agentId)) {
        this.agentQueues.set(agentId, {
          urgent: [],
          high: [],
          medium: [],
          low: []
        });
      }

      this.emit('agentSubscribed', { agentId, categoryId });
    } catch (error) {
      console.error('Error subscribing agent to category:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe agent from a category
   * @param {number} agentId - Agent ID
   * @param {number} categoryId - Category ID
   */
  async unsubscribeAgentFromCategory(agentId, categoryId) {
    try {
      // Remove from database
      await AgentCategory.destroy({
        where: { agentId, categoryId }
      });

      // Update in-memory cache
      const subscribers = this.categorySubscribers.get(categoryId);
      if (subscribers) {
        const index = subscribers.indexOf(agentId);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }

      this.emit('agentUnsubscribed', { agentId, categoryId });
    } catch (error) {
      console.error('Error unsubscribing agent from category:', error);
      throw error;
    }
  }

  /**
   * Remove ticket from agent's queue when completed
   * @param {number} ticketId - Ticket ID
   * @param {number} agentId - Agent ID
   */
  removeTicketFromQueue(ticketId, agentId) {
    const agentQueue = this.agentQueues.get(agentId);
    if (!agentQueue) return;

    const priorities = ['urgent', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const queue = agentQueue[priority];
      const index = queue.findIndex(item => item.ticketId === ticketId);
      if (index > -1) {
        queue.splice(index, 1);
        break;
      }
    }
  }

  /**
   * Handle ticket for categories with no subscribers
   * @param {object} ticket - Ticket object
   */
  async assignToGeneralPool(ticket) {
    // Find any available agent (could be super agents or general pool)
    const availableAgents = await Agent.findAll({
      where: { status: 'active' }
    });

    if (availableAgents.length === 0) {
      return await this.addToPendingQueue(ticket);
    }

    const bestAgent = await this.findAgentWithLeastTickets(
      availableAgents.map(a => a.id)
    );

    if (bestAgent) {
      await this.assignTicketToAgent(ticket, bestAgent.id);
      return bestAgent;
    }

    return await this.addToPendingQueue(ticket);
  }

  /**
   * Add ticket to pending queue when no agents available
   * @param {object} ticket - Ticket object
   */
  async addToPendingQueue(ticket) {
    await ticket.update({
      status: 'open',
      queueEnteredAt: new Date()
    });
    
    console.log(`Ticket ${ticket.id} added to pending queue`);
    return null;
  }

  /**
   * Map priority string to queue name
   * @param {string} priority - Priority level
   * @returns {string} Queue name
   */
  getPriorityQueueName(priority) {
    const priorityMap = {
      'urgent': 'urgent',
      'high': 'high', 
      'medium': 'medium',
      'low': 'low'
    };
    return priorityMap[priority] || 'medium';
  }

  /**
   * Get overall system queue statistics
   * @returns {object} System-wide queue statistics
   */
  getSystemQueueStats() {
    const stats = {
      totalAgents: this.agentQueues.size,
      categorySubscriptions: this.categorySubscribers.size,
      agentQueues: {}
    };

    for (const [agentId, queue] of this.agentQueues.entries()) {
      stats.agentQueues[agentId] = {
        urgent: queue.urgent.length,
        high: queue.high.length,
        medium: queue.medium.length,
        low: queue.low.length
      };
    }

    return stats;
  }
}

// Export singleton instance
module.exports = new TicketQueueService();