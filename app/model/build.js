'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    JSON,
    INTEGER,
  } = app.Sequelize;

  const Build = app.model.define('build', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobName: {
      type: STRING,
    },
    buildNumber: {
      type: STRING,
    },
    gitBranch: {
      type: STRING,
    },
    currentDeploy: {
      type: INTEGER,
    },
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  }, {
    indexes: [
      {
        fields: [
          'jobName',
        ],
      },
      {
        fields: [
          'jobName',
          'buildNumber',
        ],
      },
    ],
  });

  Build.associate = () => {
    app.model.Build.belongsTo(app.model.JobName, { as: 'job', foreignKey: 'jobName', sourceKey: 'jobName' });
    app.model.Build.hasMany(app.model.Deploy, { foreignKey: 'buildId', sourceKey: 'id' });
  };

  Build.prototype.getReleasePath = function() {
    return this.get('data').packages[0].path;
  };

  return Build;
};
