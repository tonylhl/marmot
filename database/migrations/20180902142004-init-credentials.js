'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      STRING,
      UUID,
      UUIDV4,
      DATE,
      TEXT,
      ENUM,
    } = Sequelize;
    await queryInterface.addColumn('builds', 'appId', {
      type: STRING,
      defaultValue: '',
    });

    await queryInterface.createTable('credentials', {
      provider: {
        type: ENUM,
        values: [ 'ALIYUN_OSS', 'AMAZON_S3' ],
      },
      environment: {
        type: STRING,
      },
      region: {
        type: STRING,
      },
      bucket: {
        type: STRING,
      },
      namespace: {
        type: STRING,
        defaultValue: '',
      },
      accessKeyId: {
        type: TEXT,
      },
      accessKeySecret: {
        type: TEXT,
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
    await queryInterface.addColumn('deploys', 'credentialUniqId', {
      type: UUID,
    });
    await queryInterface.addConstraint('deploys', [ 'credentialUniqId' ], {
      type: 'foreign key',
      references: {
        table: 'credentials',
        field: 'uniqId',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('builds', 'appId');
    const res = await queryInterface.getForeignKeyReferencesForTable('deploys');
    for (const item of res) {
      if (item.referencedTableName === 'credentials' && item.referencedColumnName === 'uniqId') {
        await queryInterface.removeConstraint('deploys', item.constraintName);
      }
    }
    await queryInterface.removeColumn('deploys', 'credentialUniqId');
    await queryInterface.dropTable('credentials');
  },
};
