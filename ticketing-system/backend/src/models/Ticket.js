const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled'),
    defaultValue: 'open',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'agents',
      key: 'id'
    },
    onUpdate: 'SET NULL',
    onDelete: 'SET NULL'
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 999.99
    }
  },
  actualHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 999.99
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  queuePosition: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'queue_position'
  },
  queueEnteredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'queue_entered_at'
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'assigned_at'
  },
  embedding: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Vector embedding of ticket title and description for semantic search'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['customer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Ticket; 