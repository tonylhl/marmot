'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      STRING,
      UUID,
      UUIDV4,
      INTEGER,
    } = Sequelize;
    return queryInterface.createTable('jobNames', {
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobName: {
        type: STRING,
        primaryKey: true,
      },
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
    return queryInterface.dropTable('jobNames');
  },
};
