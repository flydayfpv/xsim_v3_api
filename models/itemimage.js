'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class itemImage extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // 1. One item can appear in many different baggage simulations
      itemImage.hasMany(models.baggage, {
        foreignKey: 'itemImageID',
        as: 'simulatedInstances'
      });

      // 2. Each item belongs to a specific hazard category
      itemImage.belongsTo(models.itemCategory, {
        foreignKey: 'itemCategoryId',
        as: 'category'
      });
    }
  }

  itemImage.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    top: DataTypes.STRING,        // URL/Path for X-ray Top View
    side: DataTypes.STRING,       // URL/Path for X-ray Side View
    realImage: DataTypes.STRING,  // URL/Path for Real Reference Photo
    itemCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: DataTypes.TEXT   // Changed to TEXT for detailed threat info
  }, {
    sequelize,
    modelName: 'itemImage',
    tableName: 'itemImages', // Matching your migration table name
  });

  return itemImage;
};