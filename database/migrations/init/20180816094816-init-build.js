'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      STRING,
      UUID,
      UUIDV4,
      JSON,
      INTEGER,
    } = Sequelize;
    return queryInterface.createTable('builds', {
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobName: {
        type: STRING,
      },
      buildNumber: {
        type: STRING,
      },
      gitBranch: {
        type: STRING,
      },
      currentDeploy: {
        type: INTEGER,
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
    }, {
      underscored: true,
      indexes: [
        {
          fields: [
            'jobName',
          ],
        },
        {
          fields: [
            'jobName',
            'buildNumber',
          ],
        },
      ],
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('builds');
  },
};
