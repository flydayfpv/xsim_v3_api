'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'baggages',        // ✅ table name
      'examType',        // ✅ column name
      {
        type: Sequelize.ENUM('CBT', 'CBA'),
        allowNull: false,
        defaultValue: 'CBT'
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('baggages', 'examType');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_baggages_examType";'
    );
  }
};
