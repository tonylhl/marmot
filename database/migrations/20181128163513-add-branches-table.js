'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      STRING,
      DATE,
      UUID,
      UUIDV4,
    } = Sequelize;

    await queryInterface.createTable('branches', {
      groupName: {
        type: STRING,
      },
      repoName: {
        type: STRING,
      },
      branchName: {
        type: STRING,
      },
      status: {
        type: STRING,
      },
      memo: {
        type: STRING,
      },
      branchType: {
        type: STRING,
      },
      baseBranchName: {
        type: STRING,
      },
      uniqId: {
        type: UUID,
        defaultValue: UUIDV4,
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
    await queryInterface.dropTable('branches');
  },
};
