'use strict';

const uuidv4 = require('uuid/v4');
const config = require('../../test/fixtures/config-data.json');
const data = JSON.stringify(config);

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('configs', [{
      data,
      uniqId: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('configs', null, {});
  },
};
