'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    INTEGER,
  } = app.Sequelize;

  const JobName = app.model.define('jobName', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobName: {
      type: STRING,
      primaryKey: true,
    },
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  });

  return JobName;
};
