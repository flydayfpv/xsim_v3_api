'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class training_sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      training_sessions.belongsTo(models.user, { foreignKey: 'userId' });
      
    }
  }
  training_sessions.init({
    userId: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    hits: DataTypes.INTEGER,
    fars: DataTypes.INTEGER,
    hitsRate: DataTypes.DECIMAL,
    time_used: DataTypes.INTEGER,
    category_stats: DataTypes.TEXT,
    wrong_answers: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'training_sessions',
  });
  return training_sessions;
};