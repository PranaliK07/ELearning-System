export const CLASSES = [1, 2, 3, 4, 5];

export const SUBJECTS = {
  mathematics: {
    name: 'Mathematics',
    icon: '📐',
    color: '#FF6B6B'
  },
  english: {
    name: 'English',
    icon: '📚',
    color: '#4ECDC4'
  },
  hindi: {
    name: 'Hindi',
    icon: '🔤',
    color: '#45B7D1'
  },
  science: {
    name: 'Science',
    icon: '🔬',
    color: '#96CEB4'
  },
  evs: {
    name: 'Environmental Studies',
    icon: '🌍',
    color: '#FFEEAD'
  },
  social: {
    name: 'Social Studies',
    icon: '🏛️',
    color: '#D4A5A5'
  }
};

export const LESSON_TYPES = {
  video: 'Video',
  reading: 'Reading',
  quiz: 'Quiz',
  interactive: 'Interactive'
};

export const QUIZ_TYPES = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  short_answer: 'Short Answer'
};

export const ROLES = {
  admin: 'Admin',
  demo: 'Demo User',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent'
};

export const PROGRESS_STATUS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed'
};

export const ACHIEVEMENTS = [
  {
    id: 'first_lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    icon: '🎯',
    points: 50
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '💯',
    points: 100
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: 'Learn for 7 days in a row',
    icon: '🔥',
    points: 200
  },
  {
    id: 'subject_master',
    title: 'Subject Master',
    description: 'Complete all topics in a subject',
    icon: '🏆',
    points: 500
  }
];

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    updateProfile: '/auth/profile',
    changePassword: '/auth/change-password'
  },
  subjects: {
    getAll: (classNum) => `/subjects/class/${classNum}`,
    getOne: (id) => `/subjects/${id}`,
    create: '/subjects',
    update: (id) => `/subjects/${id}`,
    delete: (id) => `/subjects/${id}`
  },
  topics: {
    getBySubject: (subjectId) => `/topics/subject/${subjectId}`,
    getOne: (id) => `/topics/${id}`,
    create: '/topics',
    update: (id) => `/topics/${id}`,
    delete: (id) => `/topics/${id}`
  },
  lessons: {
    getByTopic: (topicId) => `/lessons/topic/${topicId}`,
    getOne: (id) => `/lessons/${id}`,
    create: '/lessons',
    update: (id) => `/lessons/${id}`,
    delete: (id) => `/lessons/${id}`,
    complete: (id) => `/lessons/${id}/complete`
  },
  quizzes: {
    getOne: (id) => `/quizzes/${id}`,
    submit: (id) => `/quizzes/${id}/submit`,
    results: (attemptId) => `/quizzes/results/${attemptId}`
  },
  progress: {
    stats: '/progress/stats',
    recent: '/progress/recent',
    subject: (subjectId) => `/progress/subject/${subjectId}`,
    topic: (topicId) => `/progress/topic/${topicId}`
  },
  announcements: {
    recent: '/announcements/recent',
    getAll: '/announcements',
    getOne: (id) => `/announcements/${id}`,
    create: '/announcements',
    update: (id) => `/announcements/${id}`,
    delete: (id) => `/announcements/${id}`
  }
};

export const COLORS = {
  primary: '#4CAF50',
  secondary: '#FF9800',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  mathematics: '#FF6B6B',
  english: '#4ECDC4',
  hindi: '#45B7D1',
  science: '#96CEB4',
  evs: '#FFEEAD',
  social: '#D4A5A5'
};
