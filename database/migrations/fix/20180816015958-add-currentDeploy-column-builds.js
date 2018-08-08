'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    return queryInterface.addColumn('builds', 'currentDeploy', {
      type: INTEGER,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('builds', 'currentDeploy');
  },
};
