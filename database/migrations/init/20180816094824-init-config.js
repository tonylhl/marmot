'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      UUID,
      UUIDV4,
      JSON,
      INTEGER,
    } = Sequelize;
    return queryInterface.createTable('configs', {
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      data: JSON,
      uniqId: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      created_at: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('configs');
  },
};
