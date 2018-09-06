'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      STRING,
      UUID,
      UUIDV4,
      JSON,
      DATE,
      ENUM,
    } = Sequelize;
    await queryInterface.createTable('deploys', {
      source: {
        type: STRING,
      },
      prefix: {
        type: STRING,
      },
      acl: {
        type: STRING,
      },
      type: {
        type: STRING,
      },
      state: {
        type: ENUM,
        values: [ 'INIT', 'SUCCESS', 'FAIL' ],
      },
      buildUniqId: {
        type: UUID,
      },
      data: JSON,
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
    await queryInterface.addConstraint('deploys', [ 'buildUniqId' ], {
      type: 'foreign key',
      references: {
        table: 'builds',
        field: 'uniqId',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: async queryInterface => {
    const res = await queryInterface.getForeignKeyReferencesForTable('deploys');
    for (const item of res) {
      await queryInterface.removeConstraint('deploys', item.constraintName);
    }
    await queryInterface.dropTable('deploys');
  },
};
