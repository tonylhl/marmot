'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
  } = app.Sequelize;

  const Deploy = app.model.define('deploy', {
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
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      uniq: true,
    },
  }, {
    underscored: false,
  });

  Deploy.associate = () => {
    Deploy.belongsTo(app.model.Build, {
      targetKey: 'uniqId',
      foreignKey: 'buildUniqId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  Deploy.prototype.getHtmlList = function() {
    return this.get('data').data.html;
  };

  Deploy.prototype.getOtherList = function() {
    return this.get('data').data.other;
  };

  return Deploy;
};
