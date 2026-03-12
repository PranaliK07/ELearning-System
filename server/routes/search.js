const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchAll,
  searchContent,
  searchUsers,
  searchTopics,
  getSearchSuggestions,
  getRecentSearches,
  clearSearchHistory
} = require('../controllers/searchController');

// All routes require authentication
router.use(protect);

// Search routes
router.get('/', searchAll);
router.get('/content', searchContent);
router.get('/users', searchUsers);
router.get('/topics', searchTopics);
router.get('/suggestions', getSearchSuggestions);
router.get('/recent', getRecentSearches);
router.delete('/history', clearSearchHistory);

module.exports = router;