const { Content, User, Topic, Subject } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const searchAll = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ content: [], users: [], topics: [] });
    }

    const [content, users, topics] = await Promise.all([
      // Search content
      Content.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } },
            { tags: { [Op.like]: `%${q}%` } }
          ],
          isPublished: true
        },
        include: [{
          model: Topic,
          include: [Subject]
        }],
        limit: 5
      }),

      // Search users
      User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ],
          isActive: true
        },
        attributes: ['id', 'name', 'avatar', 'role'],
        limit: 5
      }),

      // Search topics
      Topic.findAll({
        where: {
          name: { [Op.like]: `%${q}%` }
        },
        include: [Subject],
        limit: 5
      })
    ]);

    res.json({
      content,
      users,
      topics
    });
  } catch (error) {
    console.error('Search all error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchContent = async (req, res) => {
  try {
    const { q, type, grade, subject, page = 1, limit = 10 } = req.query;

    const where = {
      [Op.or]: [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ],
      isPublished: true
    };

    if (type) where.type = type;

    const include = [{
      model: Topic,
      include: [Subject]
    }];

    if (grade || subject) {
      include[0].include[0].where = {};
      if (grade) include[0].include[0].where.GradeId = grade;
      if (subject) include[0].include[0].where.id = subject;
    }

    const contents = await Content.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['views', 'DESC']]
    });

    res.json({
      contents: contents.rows,
      total: contents.count,
      page: parseInt(page),
      totalPages: Math.ceil(contents.count / limit)
    });
  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;

    const where = {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } }
      ],
      isActive: true
    };

    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'avatar', 'role', 'grade'],
      limit: 20
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchTopics = async (req, res) => {
  try {
    const { q, subjectId } = req.query;

    const where = {
      name: { [Op.like]: `%${q}%` }
    };

    if (subjectId) where.SubjectId = subjectId;

    const topics = await Topic.findAll({
      where,
      include: [Subject],
      limit: 20
    });

    res.json(topics);
  } catch (error) {
    console.error('Search topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Content.findAll({
      where: {
        title: { [Op.like]: `%${q}%` },
        isPublished: true
      },
      attributes: ['id', 'title'],
      limit: 5
    });

    res.json(suggestions.map(s => s.title));
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecentSearches = async (req, res) => {
  try {
    // You can implement this with Redis or a database table
    const recentSearches = []; // Fetch from user preferences or cache

    res.json(recentSearches);
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearSearchHistory = async (req, res) => {
  try {
    // Implement clearing search history
    res.json({ success: true, message: 'Search history cleared' });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchAll,
  searchContent,
  searchUsers,
  searchTopics,
  getSearchSuggestions,
  getRecentSearches,
  clearSearchHistory
};