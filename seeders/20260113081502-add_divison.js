'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('divisions', [
      {
        name: 'ท่าอากาศยานสุวรรณภูมิ',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ท่าอากาศยานดอนเมือง',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ท่าอากาศยานเชียงใหม่',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ท่าอากาศยานแม่ฟ้าหลวง เชียงราย',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ท่าอากาศยานภูเก็ต',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ท่าอากาศยานหาดใหญ่',
        companyID: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('divisions', {
      companyID: 1
    });
  }
};
