'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
    ENUM,
  } = app.Sequelize;

  const Build = app.model.define('build', {
    jobName: {
      type: STRING,
    },
    buildNumber: {
      type: STRING,
    },
    gitBranch: {
      type: STRING,
    },
    appId: {
      type: STRING,
    },
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    extendInfo: {
      type: JSON,
      defaultValue: {},
    },
    state: {
      type: ENUM,
      values: [ 'INIT', 'SUCCESS', 'FAIL' ],
    },
  }, { });

  Build.associate = () => {
    Build.hasMany(app.model.Deploy, {
      foreignKey: 'buildUniqId',
      sourceKey: 'uniqId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  Build.prototype.getReleasePath = function(type) {
    if (!type) return false;
    const resource = this.get('data').packages.find(i =>
      i.type === type
    );
    return resource && resource.path;
  };

  return Build;
};
