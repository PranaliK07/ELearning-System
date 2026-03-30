const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, 1 letter, 1 number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return re.test(password);
};

const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateGrade = (grade) => {
  return grade >= 1 && grade <= 5;
};

const validateContentType = (type) => {
  const validTypes = ['video', 'reading', 'quiz', 'activity'];
  return validTypes.includes(type);
};

const validateQuizQuestion = (question) => {
  if (!question.question || !question.options || !question.correctAnswer) {
    return false;
  }
  
  if (!Array.isArray(question.options) || question.options.length < 2) {
    return false;
  }
  
  if (!question.options.includes(question.correctAnswer)) {
    return false;
  }
  
  return true;
};

const validateFileType = (filename, allowedTypes) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validateGrade,
  validateContentType,
  validateQuizQuestion,
  validateFileType
};
