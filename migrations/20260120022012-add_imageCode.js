'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'baggages',          // ชื่อตาราง
      'type',              // ชื่อคอลัมน์
      {
        type: Sequelize.STRING,
        allowNull: true,   // หรือ false ตามต้องการ
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'baggages',
      'type'
    );
  }
};

