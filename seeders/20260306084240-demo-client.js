'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('clients', [{
      computer_name: 'Computer 01',
      hw_id: 'B1E822A0-E766-4766-9911-C4EFBB437B6D', // แมพจาก hwid ใน JSON
      license_key: '147963',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('clients', null, {});
  }
};