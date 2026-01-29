'use strict';
const { Model, INTEGER } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class corrective extends Model {
    static associate(models) {
      // Points to correctiveType model
      this.belongsTo(models.correctiveType, { 
        foreignKey: 'correctiveTypeId',
        as: 'type' // This allows you to use 'type' in your frontend queries
      });
      
      // Points to user model
      this.belongsTo(models.user, { 
        foreignKey: 'userId',
        as: 'user'
      });

      // Points to itemCategory model
      this.belongsTo(models.itemCategory, { 
        foreignKey: 'itemCategoryId',
        as: 'itemCategory'
      });
      // Points to area model
      this.belongsTo(models.area, { 
        foreignKey: 'areaId',
        as: 'area'
      });

    }
  }

  corrective.init({
    userId: DataTypes.INTEGER,
    itemCategoryId: DataTypes.INTEGER,
    correctiveTypeId: DataTypes.INTEGER,
    timeTarget: DataTypes.INTEGER,
    remark: DataTypes.STRING,
    areaId: DataTypes.INTEGER,
    timeGet: DataTypes.INTEGER
    
  }, {
    sequelize,
    modelName: 'corrective',
    tableName: 'correctives', // Explicit plural name
  });

  return corrective;
};