const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    defaultValue: 'student'
  },
  grade: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  bio: {
    type: DataTypes.TEXT
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWatchTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    grade: this.grade,
    avatar: this.avatar,
    bio: this.bio,
    points: this.points,
    totalWatchTime: this.totalWatchTime,
    streak: this.streak,
    lastActive: this.lastActive
  };
};

module.exports = User;