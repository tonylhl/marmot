'use strict';

module.exports = app => {
  const {
    UUID,
    UUIDV4,
    STRING,
  } = app.Sequelize;

  const Branch = app.model.define('branch', {
    groupName: {
      type: STRING,
    },
    repoName: {
      type: STRING,
    },
    branchName: {
      type: STRING,
    },
    status: {
      type: STRING,
    },
    memo: {
      type: STRING,
    },
    branchType: {
      type: STRING,
    },
    baseBranchName: {
      type: STRING,
    },
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  }, {});

  return Branch;
};
