const roleCheck = {
  isStudent: (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student only.' });
    }
    next();
  },

  isTeacher: (req, res, next) => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    next();
  },

  isAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  },

  isTeacherOrAdmin: (req, res, next) => {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Teacher or Admin only.' });
    }
    next();
  },

  canManageContent: (req, res, next) => {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Cannot manage content.' });
    }
    next();
  },

  canManageUsers: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Cannot manage users.' });
    }
    next();
  }
};

module.exports = roleCheck;