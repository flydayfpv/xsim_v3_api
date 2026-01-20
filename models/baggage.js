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

  baggage.init(
    {
      top: {
        type: DataTypes.STRING,
        allowNull: true
      },
      side: {
        type: DataTypes.STRING,
        allowNull: true
      },
      areaID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      itemImageID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      itemPos: {
        type: DataTypes.JSON, // DB เป็น LONGTEXT แต่ Sequelize ใช้ JSON ได้
        allowNull: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      itemCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      examType: {
        type: DataTypes.ENUM('CBT', 'CBA'),
        allowNull: false,
        defaultValue: 'CBT'
      }
    },
    {
      sequelize,
      modelName: 'baggage',
      tableName: 'baggages',
      timestamps: true
    }
  );

  return baggage;
};
