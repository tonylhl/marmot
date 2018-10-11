'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      STRING,
      ENUM,
    } = Sequelize;
    await queryInterface.addColumn('credentials', 'customDomain', {
      type: STRING,
    });
    await queryInterface.addColumn('credentials', 'customDomainProtocal', {
      type: ENUM,
      values: [ 'http://', 'https://' ],
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('credentials', 'customDomain');
    await queryInterface.removeColumn('credentials', 'customDomainProtocal');
  },
};
