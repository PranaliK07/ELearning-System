const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Stores which sidebar modules each role can access.
// This is intentionally small and simple so admins can change visibility
// without needing a redeploy or code change.
const RoleAccess = sequelize.define('RoleAccess', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'teacher', 'student'),
    unique: true,
    allowNull: false
  },
  modules: {
    // JSON array of module keys the role can see in the sidebar
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'RoleAccesses'
});

module.exports = RoleAccess;
