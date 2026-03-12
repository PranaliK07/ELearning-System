module.exports = {
  // User roles
  ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  },

  // Content types
  CONTENT_TYPES: {
    VIDEO: 'video',
    READING: 'reading',
    QUIZ: 'quiz',
    ACTIVITY: 'activity'
  },

  // Achievement categories
  ACHIEVEMENT_CATEGORIES: {
    WATCH: 'watch',
    QUIZ: 'quiz',
    STREAK: 'streak',
    SOCIAL: 'social',
    SPECIAL: 'special'
  },

  // Achievement rarities
  ACHIEVEMENT_RARITIES: {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    ACHIEVEMENT: 'achievement',
    QUIZ_RESULT: 'quiz_result',
    COMMENT: 'comment',
    LIKE: 'like',
    ANNOUNCEMENT: 'announcement',
    REMINDER: 'reminder'
  },

  // Grades
  GRADES: [1, 2, 3, 4, 5],

  // Default pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // File upload limits
  UPLOAD_LIMITS: {
    VIDEO: 100 * 1024 * 1024, // 100MB
    IMAGE: 5 * 1024 * 1024,    // 5MB
    AVATAR: 2 * 1024 * 1024    // 2MB
  }
};