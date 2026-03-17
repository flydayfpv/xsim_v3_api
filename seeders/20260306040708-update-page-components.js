'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // ล้างข้อมูลเก่าออกก่อนเพื่อป้องกันข้อมูลซ้ำ (Optional)
    await queryInterface.bulkDelete('pagecomponents', null, {});

    return queryInterface.bulkInsert('pagecomponents', [
      { 
        id: 1, 
        component: 'SystemConfig', 
        description: 'System Configuration Module', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 2, 
        component: 'SmartXRayEditor', 
        description: 'Smart X-Ray Editor Tool', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 3, 
        component: 'ItemManager', 
        description: 'Item Management System', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 4, 
        component: 'PolygonPlacementTest', 
        description: 'Region of Interest (Polygon) Placement', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 5, 
        component: 'Dashboard', 
        description: 'Main Analytics Dashboard', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 6, 
        component: 'CreateImage', 
        description: 'Image Creation Utility', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 7, 
        component: 'ItemRegistoration', 
        description: 'New Item Registration Form', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 8, 
        component: 'SelectionPage', 
        description: 'General Selection Page', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 9, 
        component: 'AreaGallerySelection', 
        description: 'Area Gallery Selection', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 10, 
        component: 'BaggageImageGallery', 
        description: 'Baggage Image Gallery', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 11, 
        component: 'CorrectiveList', 
        description: 'List of Corrective Actions', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 12, 
        component: 'YearlyForensicLog', 
        description: 'Yearly Forensic Training Log', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 13, 
        component: 'CorrectiveForm', 
        description: 'Corrective Action Entry Form', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 14, 
        component: 'ManualPage', 
        description: 'User Manual and Documentation', 
        createdAt: new Date(), updatedAt: new Date() 
      },
      { 
        id: 15, 
        component: 'DirectBaggageEditor', 
        description: 'Direct Baggage Editing Interface', 
        createdAt: new Date(), updatedAt: new Date() 
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // ลบข้อมูลทั้งหมดในตาราง pagecomponents เมื่อสั่ง undo seed
    return queryInterface.bulkDelete('pagecomponents', null, {});
  }
};