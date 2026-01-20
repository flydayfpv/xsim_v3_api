'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('itemCategories', [
      { name: 'Clear', createdAt: new Date(), updatedAt: new Date() },
      { name: 'IED', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Explosive', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gun / Parts and Ammunition', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sharp Object', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Other', createdAt: new Date(), updatedAt: new Date() },
      
    ], {}); 

  }, 

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
