'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create customers table
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      company: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('customer'),
        defaultValue: 'customer',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create agents table
    await queryInterface.createTable('agents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('agent'),
        defaultValue: 'agent',
        allowNull: false
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_super_agent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create tickets table
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled'),
        defaultValue: 'open',
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'general'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'agents',
          key: 'id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      estimated_hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      actual_hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('customers', ['email'], { unique: true });
    await queryInterface.addIndex('customers', ['status']);
    await queryInterface.addIndex('agents', ['email'], { unique: true });
    await queryInterface.addIndex('agents', ['status']);
    await queryInterface.addIndex('agents', ['is_super_agent']);
    await queryInterface.addIndex('tickets', ['customer_id']);
    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['priority']);
    await queryInterface.addIndex('tickets', ['category']);
    await queryInterface.addIndex('tickets', ['assigned_to']);
    await queryInterface.addIndex('tickets', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order (due to foreign key constraints)
    await queryInterface.dropTable('tickets');
    await queryInterface.dropTable('agents');
    await queryInterface.dropTable('customers');
  }
}; 