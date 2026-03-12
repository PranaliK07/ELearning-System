const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '🏆'
  },
  badgeImage: {
    type: DataTypes.STRING
  },
  criteria: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const val = this.getDataValue('criteria');
      return val ? JSON.parse(val) : {};
    },
    set(val) {
      this.setDataValue('criteria', JSON.stringify(val));
    }
  },

  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  category: {
    type: DataTypes.ENUM('watch', 'quiz', 'streak', 'social', 'special'),
    defaultValue: 'watch'
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  isHidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Achievement;