'use strict';

const uuidv4 = require('uuid/v4');
const build = require('../../test/fixtures/build-data.json');
const data = JSON.stringify(build);

module.exports = {
  up: queryInterface => {
    const foo = [];
    const baz = [];
    for (let i = 0; i < 15; i++) {
      foo.push({
        jobName: 'foo',
        buildNumber: Math.random().toString().slice(-6),
        id: i + 1,
      });
      baz.push({
        jobName: 'baz',
        buildNumber: Math.random().toString().slice(-6),
        id: i + 16,
      });
    }
    return queryInterface.bulkInsert('builds', [
      ...foo,
      ...baz,
    ].map(
      item => {
        return {
          id: item.id,
          jobName: item.jobName,
          buildNumber: item.buildNumber,
          gitBranch: 'master',
          data,
          uniqId: uuidv4(),
          created_at: new Date(),
          updated_at: new Date(),
          currentDeploy: item.id,
        };
      }
    ), {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('builds', null, {});
  },
};
