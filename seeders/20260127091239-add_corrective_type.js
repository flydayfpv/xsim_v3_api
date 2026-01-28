'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('correctiveTypes', [
      {
        name: 'ไม่ผ่านการทดสอบ (ภายใน)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ไม่ผ่านการทดสอบ (ภายนอก)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ผ่านการฝึกอบรม',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('correctiveTypes', {
      name: [
        'ไม่ผ่านการทดสอบ (ภายใน)',
        'ไม่ผ่านการทดสอบ (ภายนอก)',
        'ผ่านการฝึกอบรม'
      ]
    }, {});
  }
};
