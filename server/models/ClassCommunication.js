const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassCommunication = sequelize.define('ClassCommunication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  audience: {
    type: DataTypes.ENUM('students', 'parents', 'both'),
    allowNull: false,
    defaultValue: 'both'
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = ClassCommunication;
