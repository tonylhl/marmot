'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      STRING,
      DATE,
    } = Sequelize;

    await queryInterface.createTable('repos', {
      repoUrl: {
        type: STRING,
      },
      groupName: {
        type: STRING,
      },
      repoName: {
        type: STRING,
      },
      memo: {
        type: STRING,
      },
      repoId: {
        type: STRING,
        primaryKey: true,
      },
      createdAt: {
        type: DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('repos');
  },
};
