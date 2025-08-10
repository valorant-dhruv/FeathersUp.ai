const { sequelize } = require('../config/database');

// Import models
const Customer = require('./Customer');
const Agent = require('./Agent');
const Ticket = require('./Ticket');
const Category = require('./Category');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const AgentCategory = require('./AgentCategory');

// Define relationships between the models

// Customer relationships
Customer.hasMany(Ticket, { 
  foreignKey: 'customerId', 
  as: 'tickets',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Agent relationships
Agent.hasMany(Ticket, { 
  foreignKey: 'assignedTo', 
  as: 'assignedTickets',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL'
});

// Ticket relationships
Ticket.belongsTo(Customer, { 
  foreignKey: 'customerId', 
  as: 'customer',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Ticket.belongsTo(Agent, { 
  foreignKey: 'assignedTo', 
  as: 'assignedAgent',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL'
});

Ticket.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'ticketCategory',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Ticket.hasMany(Comment, {
  foreignKey: 'ticketId',
  as: 'comments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Ticket.hasMany(Attachment, {
  foreignKey: 'ticketId',
  as: 'attachments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Category.hasMany(Ticket, {
  foreignKey: 'categoryId',
  as: 'tickets',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Comment relationships
Comment.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Attachment relationships
Attachment.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Agent-Category many-to-many relationships
Agent.belongsToMany(Category, {
  through: AgentCategory,
  foreignKey: 'agentId',
  otherKey: 'categoryId',
  as: 'subscribedCategories',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Category.belongsToMany(Agent, {
  through: AgentCategory,
  foreignKey: 'categoryId',
  otherKey: 'agentId',
  as: 'subscribedAgents',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// AgentCategory relationships
AgentCategory.belongsTo(Agent, {
  foreignKey: 'agentId',
  as: 'agent',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AgentCategory.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Customer,
  Agent,
  Ticket,
  Category,
  Comment,
  Attachment,
  AgentCategory
}; 