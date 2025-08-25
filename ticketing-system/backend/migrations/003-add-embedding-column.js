'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tickets', 'embedding', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Vector embedding of ticket title and description for semantic search'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tickets', 'embedding');
  }
};
