const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WatchTime = sequelize.define('WatchTime', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = WatchTime;