const { Achievement, User } = require('../models');

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      order: [['points', 'DESC']]
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Achievement,
        through: { attributes: ['earnedAt'] }
      }]
    });

    res.json(user.Achievements);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [Progress, Achievement]
    });

    const achievements = await Achievement.findAll();
    const userAchievementIds = user.Achievements.map(a => a.id);
    const awarded = [];

    for (const achievement of achievements) {
      if (!userAchievementIds.includes(achievement.id)) {
        let earned = false;

        switch (achievement.criteria.type) {
          case 'watch_time':
            earned = user.totalWatchTime >= achievement.criteria.value;
            break;
          case 'content_completed':
            const completedCount = await Progress.count({
              where: { UserId: userId, completed: true }
            });
            earned = completedCount >= achievement.criteria.value;
            break;
          case 'quiz_score':
            const highScores = await Progress.count({
              where: {
                UserId: userId,
                quizScore: { [Op.gte]: achievement.criteria.value }
              }
            });
            earned = highScores >= (achievement.criteria.count || 1);
            break;
          case 'streak':
            earned = user.streak >= achievement.criteria.value;
            break;
        }

        if (earned) {
          await user.addAchievement(achievement);
          user.points += achievement.points;
          awarded.push(achievement);
        }
      }
    }

    await user.save();

    res.json({
      success: true,
      awarded,
      totalPoints: user.points
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAchievementLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['id', 'name', 'avatar', 'points'],
      where: { isActive: true },
      order: [['points', 'DESC']],
      limit: 20
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAchievement = async (req, res) => {
  try {
    const { name, description, icon, criteria, points, category, rarity } = req.body;

    const achievement = await Achievement.create({
      name,
      description,
      icon,
      criteria,
      points,
      category,
      rarity
    });

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    const { name, description, icon, criteria, points, category, rarity } = req.body;

    if (name) achievement.name = name;
    if (description) achievement.description = description;
    if (icon) achievement.icon = icon;
    if (criteria) achievement.criteria = criteria;
    if (points) achievement.points = points;
    if (category) achievement.category = category;
    if (rarity) achievement.rarity = rarity;

    await achievement.save();

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      achievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    await achievement.destroy();

    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAchievements,
  getAchievement,
  getUserAchievements,
  checkAndAwardAchievements,
  getAchievementLeaderboard,
  createAchievement,
  updateAchievement,
  deleteAchievement
};