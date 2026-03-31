const namePattern = /^[A-Za-z][A-Za-z\s'.-]*$/;

export const isBlank = (value) => !String(value ?? '').trim();

export const validateName = (value, label = 'Name') => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return `${label} is required`;
  if (normalized.length < 2) return `${label} must be at least 2 characters`;
  if (!namePattern.test(normalized)) return `${label} must only contain letters`;
  return '';
};

export const validateEmail = (value, label = 'Email') => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return `${label} is required`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return `${label} is invalid`;
  return '';
};

export const validatePassword = (value) => {
  const normalized = String(value ?? '');
  if (!normalized) return 'Password is required';
  if (normalized.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateRequiredText = (value, label, minLength = 1) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return `${label} is required`;
  if (normalized.length < minLength) return `${label} must be at least ${minLength} characters`;
  return '';
};

export const validateSelectRequired = (value, label) => {
  if (value === '' || value === null || value === undefined) return `${label} is required`;
  return '';
};

export const validatePositiveInteger = (value, label) => {
  if (value === '' || value === null || value === undefined) return `${label} is required`;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return `${label} must be a valid number`;
  return '';
};

export const validateFutureOrTodayDate = (value, label = 'Date') => {
  if (!value) return `${label} is required`;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  if (Number.isNaN(selected.getTime())) return `${label} is invalid`;
  if (selected < today) return `${label} cannot be in the past`;
  return '';
};

export const validateImageFile = (file, label = 'Image') => {
  if (!file) return '';
  if (!file.type?.startsWith('image/')) return `${label} must be an image file`;
  return '';
};

export const validateVideoFile = (file) => {
  if (!file) return 'Video file is required';
  if (!file.type?.startsWith('video/')) return 'Video must be a valid video file';
  return '';
};
