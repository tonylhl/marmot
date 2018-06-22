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

  return Build;
};
