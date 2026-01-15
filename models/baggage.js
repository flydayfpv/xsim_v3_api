'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class baggage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  baggage.init({
    top: DataTypes.STRING,
    side: DataTypes.STRING,
    areaID: DataTypes.INTEGER,
    itemImageID: DataTypes.INTEGER,
    itemPos: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'baggage',
  });
  return baggage;
};