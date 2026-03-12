export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

export const formatDate = (date, format = 'MMM dd, yyyy') => {
  const d = new Date(date);
  const options = {
    'MMM dd, yyyy': { month: 'short', day: '2-digit', year: 'numeric' },
    'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'EEE': { weekday: 'short' }
  };
  return d.toLocaleDateString('en-US', options[format] || options['MMM dd, yyyy']);
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};