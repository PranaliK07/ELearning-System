const { Content, Topic, User, Progress, Comment, Like, Bookmark } = require('../models');
const { Op } = require('sequelize');

const getContents = async (req, res) => {
  try {
    const { topicId, type, page = 1, limit = 10 } = req.query;
    const where = {};

    if (topicId) where.TopicId = topicId;
    if (type) where.type = type;

    const contents = await Content.findAndCountAll({
      where,
      include: [{
        model: Topic,
        include: [Subject]
      }],

      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['order', 'ASC']]
    });

    res.json({
      contents: contents.rows,
      total: contents.count,
      page: parseInt(page),
      totalPages: Math.ceil(contents.count / limit)
    });
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, {
      include: [
        {
          model: Topic,
          include: [Subject]
        },

        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createContent = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      videoUrl,
      readingMaterial,
      duration,
      isPremium,
      topicId,
      TopicId,
      order,
      tags
    } = req.body;

    const finalTopicId = topicId || TopicId;

    const topic = await Topic.findByPk(finalTopicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found (id: ' + finalTopicId + ')' });
    }


    const content = await Content.create({
      title,
      type,
      description,
      videoUrl,
      readingMaterial,
      duration,
      isPremium,
      order,
      tags,
      TopicId: finalTopicId,

      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const {
      title,
      description,
      videoUrl,
      readingMaterial,
      duration,
      isPremium,
      isPublished,
      order,
      tags
    } = req.body;

    if (title) content.title = title;
    if (description) content.description = description;
    if (videoUrl) content.videoUrl = videoUrl;
    if (readingMaterial) content.readingMaterial = readingMaterial;
    if (duration) content.duration = duration;
    if (isPremium !== undefined) content.isPremium = isPremium;
    if (isPublished !== undefined) content.isPublished = isPublished;
    if (order) content.order = order;
    if (tags) content.tags = tags;

    await content.save();

    res.json({
      success: true,
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await content.destroy();

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContentProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      where: {
        ContentId: req.params.id,
        UserId: req.user.id
      }
    });

    res.json(progress || { watchTime: 0, completed: false });
  } catch (error) {
    console.error('Get content progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const incrementViews = async (req, res) => {
  try {
    await Content.increment('views', {
      by: 1,
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;

    const existingLike = await Like.findOne({
      where: {
        ContentId: contentId,
        UserId: userId
      }
    });

    if (existingLike) {
      await existingLike.destroy();
      await Content.decrement('likes', { by: 1, where: { id: contentId } });
      res.json({ liked: false });
    } else {
      await Like.create({
        ContentId: contentId,
        UserId: userId
      });
      await Content.increment('likes', { by: 1, where: { id: contentId } });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.create({
      text,
      ContentId: req.params.id,
      UserId: req.user.id
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { ContentId: req.params.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        ContentId: req.params.id
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.UserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.destroy();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;

    const existingBookmark = await Bookmark.findOne({
      where: {
        ContentId: contentId,
        UserId: userId
      }
    });

    if (existingBookmark) {
      await existingBookmark.destroy();
      res.json({ bookmarked: false });
    } else {
      await Bookmark.create({
        ContentId: contentId,
        UserId: userId
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecommendedContent = async (req, res) => {
  try {
    // Get content based on user's grade and watch history
    const user = await User.findByPk(req.user.id);

    const recommended = await Content.findAll({
      where: { isPublished: true },
      include: [{
        model: Topic,
        include: [{
          model: Subject,
          where: { GradeId: user.grade }
        }]
      }],
      limit: 10,
      order: [['views', 'DESC']]
    });

    res.json(recommended);
  } catch (error) {
    console.error('Get recommended content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTrendingContent = async (req, res) => {
  try {
    const trending = await Content.findAll({
      where: { isPublished: true },
      limit: 10,
      order: [
        ['views', 'DESC'],
        ['likes', 'DESC']
      ]
    });

    res.json(trending);
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchContent = async (req, res) => {
  try {
    const { q } = req.query;

    const contents = await Content.findAll({
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
        include: ['Subject']
      }],
      limit: 20
    });

    res.json(contents);
  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  getContentProgress,
  incrementViews,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  toggleBookmark,
  getRecommendedContent,
  getTrendingContent,
  searchContent
};