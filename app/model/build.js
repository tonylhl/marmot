'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
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
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  }, {
    underscored: false,
  });

  Build.associate = () => {
    Build.hasMany(app.model.Deploy, {
      as: 'deploy',
      foreignKey: 'buildUniqId',
      sourceKey: 'uniqId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  Build.prototype.getReleasePath = function() {
    return this.get('data').packages[0].path;
  };

  return Build;
};
