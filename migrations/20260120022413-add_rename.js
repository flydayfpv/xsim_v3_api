'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'baggages', // table name
      'type',     // old column
      'code'      // new column
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'baggages',
      'code',
      'type'
    );
  }
};
