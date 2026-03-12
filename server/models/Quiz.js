const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
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
  questions: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidQuestions(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Questions must be a non-empty array');
        }
        value.forEach((q, index) => {
          if (!q.question || !q.options || !q.correctAnswer) {
            throw new Error(`Question ${index + 1} is missing required fields`);
          }
          if (!Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Question ${index + 1} must have at least 2 options`);
          }
        });
      }
    }
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Time limit in minutes'
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    validate: {
      min: 0,
      max: 100
    }
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Quiz;