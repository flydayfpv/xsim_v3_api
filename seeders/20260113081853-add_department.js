'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('departments', [
      {
        name: 'ตรวจค้นบุคคลและสัมภาระ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'รักษาความปลอดภัย',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', {
      name: [
        'ตรวจค้นบุคคลและสัมภาระ',
        'รักษาความปลอดภัย'
      ]
    });
  }
};
