'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      session.belongsTo(models.user, { foreignKey: 'userID' });
    }
  }
  session.init({
    userID: DataTypes.INTEGER,
    refresh_token: DataTypes.STRING,
    device_id: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.STRING,
    last_active_at: DataTypes.DATE,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'session',
  });
  return session;
};