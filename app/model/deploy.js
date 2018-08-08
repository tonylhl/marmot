'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
    INTEGER,
  } = app.Sequelize;

  const Deploy = app.model.define('deploy', {
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
    data: JSON,
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
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  });

  Deploy.associate = () => {
    app.model.Deploy.belongsTo(app.model.Build, { foreignKey: 'buildId', sourceKey: 'id' });
  };

  Deploy.prototype.getHtmlList = function() {
    return this.get('data').data.html;
  };

  Deploy.prototype.getOtherList = function() {
    return this.get('data').data.other;
  };

  return Deploy;
};
