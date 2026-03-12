const crypto = require('crypto');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

const paginate = (data, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {};
  
  if (endIndex < data.length) {
    results.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit
    };
  }
  
  results.results = data.slice(startIndex, endIndex);
  results.total = data.length;
  results.page = page;
  results.totalPages = Math.ceil(data.length / limit);
  
  return results;
};

module.exports = {
  generateRandomString,
  formatDate,
  calculatePercentage,
  formatFileSize,
  slugify,
  groupBy,
  paginate
};