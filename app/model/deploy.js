'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
    ENUM,
  } = app.Sequelize;

  const Deploy = app.model.define('deploy', {
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
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      uniq: true,
    },
  }, { });

  Deploy.associate = () => {
    Deploy.belongsTo(app.model.Build, {
      targetKey: 'uniqId',
      foreignKey: 'buildUniqId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
    Deploy.belongsTo(app.model.Credential, {
      targetKey: 'uniqId',
      foreignKey: 'credentialUniqId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  return Deploy;
};
