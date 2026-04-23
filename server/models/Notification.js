const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('achievement', 'quiz_result', 'comment', 'like', 'announcement', 'reminder', 'doubt', 'doubt_reply', 'new_video', 'new_notes', 'new_assignment', 'assignment_submission', 'new_quiz', 'attendance', 'feedback'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const val = this.getDataValue('data');
      return val ? JSON.parse(val) : {};
    },
    set(val) {
      const stringVal = typeof val === 'string' ? val : JSON.stringify(val || {});
      this.setDataValue('data', stringVal);
    }
  },

  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

const rawCreate = Notification.create.bind(Notification);
const rawBulkCreate = Notification.bulkCreate.bind(Notification);

const mirrorToAdmins = async (notificationRows = []) => {
  const User = sequelize.models.User;
  if (!User || !Array.isArray(notificationRows) || notificationRows.length === 0) {
    return;
  }

  const uniqueRecipientIds = [...new Set(
    notificationRows
      .map((notification) => notification?.userId)
      .filter(Boolean)
  )];

  if (!uniqueRecipientIds.length) {
    return;
  }

  const recipients = await User.findAll({
    where: { id: uniqueRecipientIds },
    attributes: ['id', 'role', 'isDeleted']
  });

  const roleByUserId = new Map(recipients.map((user) => [Number(user.id), user.role]));
  const adminIds = (await User.findAll({
    where: { role: 'admin', isDeleted: false },
    attributes: ['id']
  }))
    .map((user) => Number(user.id));

  if (!adminIds.length) {
    return;
  }

  const adminCopies = [];

  for (const notification of notificationRows) {
    const recipientRole = roleByUserId.get(Number(notification.userId));
    if (!['student', 'teacher'].includes(recipientRole)) {
      continue;
    }

    for (const adminId of adminIds) {
      adminCopies.push({
        userId: adminId,
        senderId: notification.senderId ?? null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: false,
        isDeleted: false
      });
    }
  }

  if (adminCopies.length) {
    await rawBulkCreate(adminCopies, { hooks: false, validate: true });
  }
};

Notification.create = async (...args) => {
  const notification = await rawCreate(...args);
  try {
    await mirrorToAdmins([notification.get({ plain: true })]);
  } catch (error) {
    console.error('[Notification Mirror] create wrapper error:', error);
  }
  return notification;
};

Notification.bulkCreate = async (...args) => {
  const notifications = await rawBulkCreate(...args);
  try {
    await mirrorToAdmins(notifications.map((notification) => notification.get({ plain: true })));
  } catch (error) {
    console.error('[Notification Mirror] bulkCreate wrapper error:', error);
  }
  return notifications;
};

module.exports = Notification;
