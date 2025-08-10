const { Agent, Category, AgentCategory } = require('../models');
const TicketService = require('../services/TicketService');
const { successResponse, errorResponse, createdResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');

class AgentController {
  /**
   * Create a new agent with category subscriptions
   */
  static async createAgent(req, res) {
    try {
      const { name, email, password, categoryIds = [] } = req.body;
      const user = req.user;

      // Only super agents can create agents
      if (user.role !== 'agent' || !user.isSuperAgent) {
        return errorResponse(res, 'Only super agents can create agents', 'Only super agents can create agents', 403);
      }

      // Check if agent already exists
      const existingAgent = await Agent.findOne({ where: { email } });
      if (existingAgent) {
        return errorResponse(res, 'Agent with this email already exists', 'Agent with this email already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create agent
      const agent = await Agent.create({
        name,
        email,
        password: hashedPassword,
        role: 'agent',
        status: 'active'
      });

      // Subscribe agent to categories if provided
      if (categoryIds.length > 0) {
        await TicketService.subscribeAgentToCategories(agent.id, categoryIds);
      }

      // Fetch agent with subscribed categories
      const agentWithCategories = await Agent.findByPk(agent.id, {
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      createdResponse(res, { 
        agent: agentWithCategories,
        message: `Agent created and subscribed to ${categoryIds.length} categories`
      }, 'Agent created successfully');
    } catch (error) {
      console.error('Create agent error:', error);
      errorResponse(res, 'Failed to create agent', 'Failed to create agent', 500);
    }
  }

  /**
   * Get all agents with their category subscriptions
   */
  static async getAgents(req, res) {
    try {
      const user = req.user;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can access agent information', 'Only agents can access agent information', 403);
      }

      const agents = await Agent.findAll({
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      successResponse(res, { agents }, 'Agents retrieved successfully');
    } catch (error) {
      console.error('Get agents error:', error);
      errorResponse(res, 'Failed to retrieve agents', 'Failed to retrieve agents', 500);
    }
  }

  /**
   * Get agent by ID with subscribed categories
   */
  static async getAgentById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can access agent information', 'Only agents can access agent information', 403);
      }

      // Agents can only see their own details unless they're super agents
      if (!user.isSuperAgent && parseInt(id) !== user.id) {
        return errorResponse(res, 'Access denied to this agent information', 'Access denied to this agent information', 403);
      }

      const agent = await Agent.findByPk(id, {
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      if (!agent) {
        return errorResponse(res, 'Agent not found', 'Agent not found', 404);
      }

      successResponse(res, { agent }, 'Agent retrieved successfully');
    } catch (error) {
      console.error('Get agent by ID error:', error);
      errorResponse(res, 'Failed to retrieve agent', 'Failed to retrieve agent', 500);
    }
  }

  /**
   * Subscribe agent to categories
   */
  static async subscribeToCategories(req, res) {
    try {
      const { agentId } = req.params;
      const { categoryIds } = req.body;
      const user = req.user;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can manage subscriptions', 'Only agents can manage subscriptions', 403);
      }

      // Agents can only manage their own subscriptions unless they're super agents
      if (!user.isSuperAgent && parseInt(agentId) !== user.id) {
        return errorResponse(res, 'Access denied to manage this agent subscriptions', 'Access denied to manage this agent subscriptions', 403);
      }

      if (!categoryIds || !Array.isArray(categoryIds)) {
        return errorResponse(res, 'Category IDs array is required', 'Category IDs array is required', 400);
      }

      // Verify agent exists
      const agent = await Agent.findByPk(agentId);
      if (!agent) {
        return errorResponse(res, 'Agent not found', 'Agent not found', 404);
      }

      // Verify all categories exist
      const categories = await Category.findAll({
        where: { id: categoryIds, isActive: true }
      });

      if (categories.length !== categoryIds.length) {
        return errorResponse(res, 'One or more categories not found or inactive', 'One or more categories not found or inactive', 400);
      }

      // Subscribe to categories
      const results = await TicketService.subscribeAgentToCategories(agentId, categoryIds);

      // Fetch updated agent with categories
      const updatedAgent = await Agent.findByPk(agentId, {
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      successResponse(res, { 
        agent: updatedAgent,
        subscriptions: results
      }, 'Agent subscribed to categories successfully');
    } catch (error) {
      console.error('Subscribe to categories error:', error);
      errorResponse(res, 'Failed to subscribe to categories', 'Failed to subscribe to categories', 500);
    }
  }

  /**
   * Unsubscribe agent from categories
   */
  static async unsubscribeFromCategories(req, res) {
    try {
      const { agentId } = req.params;
      const { categoryIds } = req.body;
      const user = req.user;

      if (user.role !== 'agent') {
        return errorResponse(res, 'Only agents can manage subscriptions', 'Only agents can manage subscriptions', 403);
      }

      // Agents can only manage their own subscriptions unless they're super agents
      if (!user.isSuperAgent && parseInt(agentId) !== user.id) {
        return errorResponse(res, 'Access denied to manage this agent subscriptions', 'Access denied to manage this agent subscriptions', 403);
      }

      if (!categoryIds || !Array.isArray(categoryIds)) {
        return errorResponse(res, 'Category IDs array is required', 'Category IDs array is required', 400);
      }

      // Verify agent exists
      const agent = await Agent.findByPk(agentId);
      if (!agent) {
        return errorResponse(res, 'Agent not found', 'Agent not found', 404);
      }

      // Remove subscriptions
      const removeCount = await AgentCategory.destroy({
        where: {
          agentId: agentId,
          categoryId: categoryIds
        }
      });

      // Fetch updated agent with categories
      const updatedAgent = await Agent.findByPk(agentId, {
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      successResponse(res, { 
        agent: updatedAgent,
        removedCount
      }, `Agent unsubscribed from ${removeCount} categories successfully`);
    } catch (error) {
      console.error('Unsubscribe from categories error:', error);
      errorResponse(res, 'Failed to unsubscribe from categories', 'Failed to unsubscribe from categories', 500);
    }
  }

  /**
   * Update agent status (super agents only)
   */
  static async updateAgentStatus(req, res) {
    try {
      const { agentId } = req.params;
      const { status } = req.body;
      const user = req.user;

      if (user.role !== 'agent' || !user.isSuperAgent) {
        return errorResponse(res, 'Only super agents can update agent status', 'Only super agents can update agent status', 403);
      }

      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        return errorResponse(res, 'Invalid status. Must be active, inactive, or suspended', 'Invalid status. Must be active, inactive, or suspended', 400);
      }

      const agent = await Agent.findByPk(agentId);
      if (!agent) {
        return errorResponse(res, 'Agent not found', 'Agent not found', 404);
      }

      await agent.update({ status });

      const updatedAgent = await Agent.findByPk(agentId, {
        include: [{
          model: Category,
          as: 'subscribedCategories',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      successResponse(res, { agent: updatedAgent }, 'Agent status updated successfully');
    } catch (error) {
      console.error('Update agent status error:', error);
      errorResponse(res, 'Failed to update agent status', 'Failed to update agent status', 500);
    }
  }
}

module.exports = AgentController;