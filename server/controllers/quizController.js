const { Quiz, Progress, User, Topic } = require('../models');
const { Op } = require('sequelize');

const getQuizzes = async (req, res) => {
  try {
    const { topicId, page = 1, limit = 10 } = req.query;
    const where = {};
    
    if (topicId) where.TopicId = topicId;

    const quizzes = await Quiz.findAndCountAll({
      where,
      include: [Topic],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      quizzes: quizzes.rows,
      total: quizzes.count,
      page: parseInt(page),
      totalPages: Math.ceil(quizzes.count / limit)
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [Topic]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Don't send answers to client
    const quizData = quiz.toJSON();
    if (quizData.questions) {
      quizData.questions = quizData.questions.map(q => ({
        ...q,
        correctAnswer: undefined // Remove correct answer
      }));
    }

    res.json(quizData);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      topicId
    } = req.body;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      TopicId: topicId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const {
      title,
      description,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      isPublished
    } = req.body;

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;
    if (maxAttempts) quiz.maxAttempts = maxAttempts;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.destroy();

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const startQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check attempts
    const attempts = await Progress.count({
      where: {
        QuizId: quizId,
        UserId: userId
      }
    });

    if (attempts >= quiz.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Create quiz session
    const session = {
      quizId: quiz.id,
      startTime: new Date(),
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        type: q.type
      }))
    };

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const { answers, timeSpent } = req.body;

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    const results = [];

    quiz.questions.forEach((q, index) => {
      const isCorrect = q.correctAnswer === answers[index];
      if (isCorrect) score++;
      
      results.push({
        question: q.question,
        correct: isCorrect,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[index]
      });
    });

    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= quiz.passingScore;

    // Save progress
    const progress = await Progress.create({
      UserId: userId,
      QuizId: quizId,
      quizScore: percentage,
      quizAttempts: 1,
      quizPassed: passed,
      lastQuizAttempt: new Date(),
      completed: true
    });

    // Update quiz stats
    await Quiz.increment('attempts', { by: 1, where: { id: quizId } });
    
    // Update average score
    const avgScore = ((quiz.avgScore * (quiz.attempts - 1)) + percentage) / quiz.attempts;
    await Quiz.update({ avgScore }, { where: { id: quizId } });

    res.json({
      success: true,
      score,
      total: quiz.questions.length,
      percentage,
      passed,
      results,
      timeSpent
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const results = await Progress.findAll({
      where: {
        QuizId: req.params.id,
        UserId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(results);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Progress.findAll({
      where: {
        QuizId: req.params.id,
        quizPassed: true
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['quizScore', 'DESC']],
      limit: 10
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get quiz leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizStats = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
      totalAttempts: quiz.attempts,
      averageScore: quiz.avgScore,
      passRate: 0 // Calculate this
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getQuizLeaderboard,
  getQuizStats
};