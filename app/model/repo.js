'use strict';

module.exports = app => {
  const {
    STRING,
  } = app.Sequelize;

  const Repo = app.model.define('repo', {
    repoUrl: {
      type: STRING,
    },
    groupName: {
      type: STRING,
    },
    repoName: {
      type: STRING,
    },
    memo: {
      type: STRING,
    },
    repoId: {
      type: STRING,
      primaryKey: true,
    },

  }, {});

  return Repo;
};
