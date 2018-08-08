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
    return queryInterface.createTable('deploys', {
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      source: {
        type: STRING,
      },
      region: {
        type: STRING,
      },
      bucket: {
        type: STRING,
      },
      prefix: {
        type: STRING,
      },
      acl: {
        type: STRING,
      },
      buildId: {
        type: INTEGER,
        defaultValue: null,
        references: {
          model: 'builds',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    return queryInterface.dropTable('deploys');
  },
};
