const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('video', 'reading', 'quiz', 'activity'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  videoUrl: {
    type: DataTypes.STRING
  },
  videoFile: {
    type: DataTypes.STRING
  },
  thumbnail: {
    type: DataTypes.STRING
  },
  readingMaterial: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duration in minutes'
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('tags');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('tags', JSON.stringify(val));
    }
  },
  metadata: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const val = this.getDataValue('metadata');
      return val ? JSON.parse(val) : {};
    },
    set(val) {
      this.setDataValue('metadata', JSON.stringify(val));
    }
  },

  // Class targeting (optional)
  GradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'grades',
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
  LessonId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Lessons',
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

module.exports = Content;
