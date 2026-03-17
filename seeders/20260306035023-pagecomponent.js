'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('pagecomponents', [
      { component: 'systemconfig', description: 'System Configuration Module', createdAt: new Date(), updatedAt: new Date() },
      { component: 'smart', description: 'Smart X-Ray Editor Tool', createdAt: new Date(), updatedAt: new Date() },
      { component: 'itemmanager', description: 'Item Management System', createdAt: new Date(), updatedAt: new Date() },
      { component: 'Roi', description: 'Region of Interest (Polygon) Placement', createdAt: new Date(), updatedAt: new Date() },
      { component: 'dashboard', description: 'Main Analytics Dashboard', createdAt: new Date(), updatedAt: new Date() },
      { component: 'createimage', description: 'Image Creation Utility', createdAt: new Date(), updatedAt: new Date() },
      { component: 'ItemRegistoration', description: 'New Item Registration Form', createdAt: new Date(), updatedAt: new Date() },
      { component: 'selection', description: 'General Selection Page', createdAt: new Date(), updatedAt: new Date() },
      { component: 'gallery', description: 'Area Gallery Selection', createdAt: new Date(), updatedAt: new Date() },
      { component: 'baggagegallery', description: 'Baggage Image Gallery', createdAt: new Date(), updatedAt: new Date() },
      { component: 'CorrectiveList', description: 'List of Corrective Actions', createdAt: new Date(), updatedAt: new Date() },
      { component: 'training', description: 'Yearly Forensic Training Log', createdAt: new Date(), updatedAt: new Date() },
      { component: 'correctiveform', description: 'Corrective Action Entry Form', createdAt: new Date(), updatedAt: new Date() },
      { component: 'manual', description: 'User Manual and Documentation', createdAt: new Date(), updatedAt: new Date() },
      { component: 'DirectBaggageEditor', description: 'Direct Baggage Editing Interface', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('pagecomponents', null, {});
  }
};