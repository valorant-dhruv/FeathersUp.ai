const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('agent'),
    defaultValue: 'agent',
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      canManageCustomers: true,
      canManageTickets: true,
      canManageAgents: true,
      canViewReports: true,
      canManageSystem: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    allowNull: false
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isSuperAgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'agents',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_super_agent']
    }
  ]
});

module.exports = Agent; 