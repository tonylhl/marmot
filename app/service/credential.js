'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;

const defaultAlgorithm = 'aes-256-cbc';

module.exports = class CredentialService extends Service {
  constructor(ctx) {
    super(ctx);
    this.key = ctx.app.config.keys;
    this.algorithm = defaultAlgorithm;
  }

  async queryAllCredentials(selector = {}) {
    const res = [];
    const queryResult = await this.ctx.model.Credential.findAll({
      ...selector,
      order: [
        [
          'createdAt',
          'ASC',
        ],
      ],
      attributes: {
        exclude: [
          'accessKeyId',
        ],
      },
    });
    for (const record of queryResult) {
      const data = record.get({ plain: true });
      data.authType = record.getAuthType();
      res.push(data);
      delete data.accessKeySecret;
    }
    return res;
  }

  async queryCredentialByUniqId({ uniqId }) {
    const res = await this.ctx.model.Credential.findOne({
      where: {
        uniqId,
      },
    });
    if (!res) {
      return null;
    }
    const values = res.get({ plain: true });
    const decryptId = this.decrypt(values.accessKeyId);
    const decryptKey = this.decrypt(values.accessKeySecret);

    const hideSensetive = (text = '') => {
      if (text.length < 3) {
        return '***';
      }
      return text[0] + '*'.repeat(text.length - 2) + text[text.length - 1];
    };
    return {
      ...values,
      accessKeyId: hideSensetive(decryptId),
      accessKeySecret: hideSensetive(decryptKey),
    };
  }

  async queryDecryptedCredentialByUniqId({ uniqId }) {
    const res = await this.ctx.model.Credential.findOne({
      where: {
        uniqId,
      },
    });
    if (!res) {
      return null;
    }
    const values = res.get({ plain: true });
    return {
      ...values,
      accessKeyId: this.decrypt(values.accessKeyId),
      accessKeySecret: this.decrypt(values.accessKeySecret),
    };
  }

  async validateInputCredential({
    uniqId,
    inputAccessKeyId,
    inputAccessKeySecret,
  }) {
    const credential = await this.queryDecryptedCredentialByUniqId({ uniqId });
    if (!credential) {
      return {
        success: false,
        message: 'Credential not found.',
      };
    }
    const {
      accessKeyId,
      accessKeySecret,
    } = credential;
    if (inputAccessKeyId === accessKeyId &&
      inputAccessKeySecret === accessKeySecret) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      message: 'AccessId or secretKey not matched',
    };
  }

  async createCredential({
    provider,
    bucketTag,
    region,
    bucket,
    namespace,
    accessKeyId,
    accessKeySecret,
  }) {
    return await this.ctx.model.Credential.create({
      provider,
      bucketTag,
      region,
      bucket,
      namespace,
      accessKeyId: this.encrypt(accessKeyId),
      accessKeySecret: accessKeySecret
        ? this.encrypt(accessKeySecret)
        : '',
    });
  }

  async updateCredential({
    uniqId,
    accessKeyId,
    accessKeySecret,
  }) {
    return await this.ctx.model.Credential.update(
      {
        accessKeyId: this.encrypt(accessKeyId),
        accessKeySecret: this.encrypt(accessKeySecret),
      },
      {
        where: {
          uniqId,
        },
      }
    );
  }

  async deleteCredentialByUniqId({ uniqId }) {
    return await this.ctx.model.Credential.destroy({
      where: {
        uniqId,
      },
    });
  }

  encrypt(data) {
    const cipher = crypto.createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(data) {
    try {
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      return '';
    }
  }
};

