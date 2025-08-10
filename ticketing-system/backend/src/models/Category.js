const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#007bff',
    validate: {
      is: /^#[0-9A-F]{6}$/i // Hex color validation
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Category;