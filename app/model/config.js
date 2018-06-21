'use strict';

module.exports = app => {
  const {
    UUID,
    UUIDV4,
    JSON,
    INTEGER,
  } = app.Sequelize;

  const Config = app.model.define('config', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    data: JSON,
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  });

  return Config;
};
