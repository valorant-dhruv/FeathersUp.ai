const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create agent_categories junction table
    await queryInterface.createTable('agent_categories', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'agents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate subscriptions
    await queryInterface.addConstraint('agent_categories', {
      fields: ['agent_id', 'category_id'],
      type: 'unique',
      name: 'unique_agent_category'
    });

    // Add indexes for performance
    await queryInterface.addIndex('agent_categories', ['agent_id']);
    await queryInterface.addIndex('agent_categories', ['category_id']);

    // Add new fields to tickets table for queue management
    await queryInterface.addColumn('tickets', 'queue_position', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('tickets', 'queue_entered_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('tickets', 'assigned_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tickets', 'assigned_at');
    await queryInterface.removeColumn('tickets', 'queue_entered_at');
    await queryInterface.removeColumn('tickets', 'queue_position');
    await queryInterface.dropTable('agent_categories');
  }
};