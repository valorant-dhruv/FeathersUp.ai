const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AgentCategory = sequelize.define('AgentCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'agent_id',
    references: {
      model: 'agents',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'agent_categories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['agent_id', 'category_id'],
      name: 'unique_agent_category'
    },
    {
      fields: ['agent_id']
    },
    {
      fields: ['category_id']
    }
  ]
});

module.exports = AgentCategory;