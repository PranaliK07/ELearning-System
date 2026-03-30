const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('daily', 'practice', 'revision'),
    defaultValue: 'daily'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  GradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Grades',
      key: 'id'
    }
  },
  SubjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Subjects',
      key: 'id'
    }
  },
  TopicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Topics',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Lesson;
