'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class correctiveType extends Model {
    static associate(models) {
      // One Type can have many Corrective records
      this.hasMany(models.corrective, { 
        foreignKey: 'correctiveTypeId',
        as: 'correctives'
      });
    }
  }

  correctiveType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'correctiveType',
    tableName: 'correctiveTypes', // THIS FIXES YOUR ERROR
  });

  return correctiveType;
};