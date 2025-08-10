const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000],
      notEmpty: true
    }
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ticket_id',
    references: {
      model: 'tickets',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_internal'
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'edited_at'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['is_internal']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Comment;