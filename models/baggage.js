'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class baggage extends Model {
    static associate(models) {
      baggage.belongsTo(models.itemImage, {
        foreignKey: 'itemImageID',
        as: 'item'
      });

      baggage.belongsTo(models.area, {
        foreignKey: 'areaID',
        as: 'location'
      });
      baggage.belongsTo(models.itemCategory, {
        foreignKey: 'itemCategoryID',
        as: 'category'
      });
    }
  }

baggage.init({
  top: {
    type: DataTypes.STRING,
    allowNull: true
  },
  side: {
    type: DataTypes.STRING,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemPos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  areaID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemImageID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemCategoryID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'baggage',
  tableName: 'baggages'
});


  return baggage;
};
