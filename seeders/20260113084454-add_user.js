'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        emid: 10001,
        citizenid: 1234567890123,
        password: hashedPassword,
        prefixID: 1,
        fname: 'สมชาย',
        lname: 'ใจดี',
        divisionID: 2,
        departmentID: 1,
        roleID: 1,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        emid: 10002,
        citizenid: 9876543210987,
        password: hashedPassword,
        prefixID: 2,
        fname: 'สมหญิง',
        lname: 'ตั้งใจ',
        divisionID: 1,
        departmentID: 2,
        roleID: 2,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      emid: [10001, 10002]
    });
  }
};
