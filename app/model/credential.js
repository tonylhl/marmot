'use strict';

module.exports = app => {
  const {
    STRING,
    UUID,
    UUIDV4,
    TEXT,
    ENUM,
  } = app.Sequelize;

  const Credential = app.model.define('credential', {
    provider: {
      type: ENUM,
      values: [ 'ALIYUN_OSS', 'AMAZON_S3' ],
    },
    bucketTag: {
      type: STRING,
    },
    region: {
      type: STRING,
    },
    bucket: {
      type: STRING,
    },
    namespace: {
      type: STRING,
      defaultValue: '',
    },
    accessKeyId: {
      type: TEXT,
    },
    accessKeySecret: {
      type: TEXT,
    },
    uniqId: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  }, { });

  return Credential;
};
