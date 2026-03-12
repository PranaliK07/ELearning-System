const User = require('./User');
const Grade = require('./Grade');
const Subject = require('./Subject');
const Topic = require('./Topic');
const Content = require('./Content');
const Quiz = require('./Quiz');
const Progress = require('./Progress');
const Achievement = require('./Achievement');
const WatchTime = require('./WatchTime');
const Announcement = require('./Announcement');
const Comment = require('./Comment');
const Like = require('./Like');
const Bookmark = require('./Bookmark');
const Notification = require('./Notification');

// Grade Associations
Grade.hasMany(Subject, { onDelete: 'CASCADE' });
Subject.belongsTo(Grade);

// Subject Associations
Subject.hasMany(Topic, { onDelete: 'CASCADE' });
Topic.belongsTo(Subject);

// Topic Associations
Topic.hasMany(Content, { onDelete: 'CASCADE' });
Content.belongsTo(Topic);
Topic.hasMany(Quiz, { onDelete: 'CASCADE' });
Quiz.belongsTo(Topic);

// User Associations
User.belongsTo(Grade);
User.hasMany(Progress, { onDelete: 'CASCADE' });
User.belongsToMany(Achievement, { through: 'UserAchievements' });
User.hasMany(WatchTime, { onDelete: 'CASCADE' });
User.hasMany(Comment, { onDelete: 'CASCADE' });
User.hasMany(Like, { onDelete: 'CASCADE' });
User.hasMany(Bookmark, { onDelete: 'CASCADE' });
User.hasMany(Notification, { as: 'ReceivedNotifications', foreignKey: 'userId' });
User.hasMany(Notification, { as: 'SentNotifications', foreignKey: 'senderId' });

// Content Associations
Content.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Content.hasMany(Progress, { onDelete: 'CASCADE' });
Content.hasMany(WatchTime, { onDelete: 'CASCADE' });
Content.hasMany(Comment, { onDelete: 'CASCADE' });
Content.hasMany(Like, { onDelete: 'CASCADE' });
Content.hasMany(Bookmark, { onDelete: 'CASCADE' });

// Quiz Associations
Quiz.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Quiz.hasMany(Progress, { onDelete: 'CASCADE' });

// Progress Associations
Progress.belongsTo(User);
Progress.belongsTo(Content);
Progress.belongsTo(Quiz);

// WatchTime Associations
WatchTime.belongsTo(User);
WatchTime.belongsTo(Content);

// Achievement Associations
Achievement.belongsToMany(User, { through: 'UserAchievements' });

// Comment Associations
Comment.belongsTo(User);
Comment.belongsTo(Content);
Comment.hasMany(Comment, { as: 'Replies', foreignKey: 'parentId' });

// Like Associations
Like.belongsTo(User);
Like.belongsTo(Content);

// Bookmark Associations
Bookmark.belongsTo(User);
Bookmark.belongsTo(Content);

// Notification Associations
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Announcement Associations
Announcement.belongsTo(User, { as: 'author' });

module.exports = {
  User,
  Grade,
  Subject,
  Topic,
  Content,
  Quiz,
  Progress,
  Achievement,
  WatchTime,
  Announcement,
  Comment,
  Like,
  Bookmark,
  Notification
};