const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attachment = sequelize.define('Attachment', {
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
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name',
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type',
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'file_size',
    validate: {
      min: 1,
      max: 10485760 // 10MB max
    }
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path',
    validate: {
      len: [1, 500],
      notEmpty: true
    }
  }
}, {
  tableName: 'attachments',
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
      fields: ['mime_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Attachment;