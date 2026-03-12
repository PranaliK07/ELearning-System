const { Achievement } = require('../models');

const achievementData = [
  {
    name: 'First Steps',
    description: 'Watch your first video',
    icon: '🌟',
    criteria: { type: 'watch_time', value: 10 },
    points: 10,
    category: 'watch',
    rarity: 'common'
  },
  {
    name: 'Quick Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    criteria: { type: 'content_completed', value: 5 },
    points: 20,
    category: 'watch',
    rarity: 'common'
  },
  {
    name: 'Quiz Master',
    description: 'Score 100% in any quiz',
    icon: '🏆',
    criteria: { type: 'quiz_score', value: 100 },
    points: 30,
    category: 'quiz',
    rarity: 'rare'
  },
  {
    name: 'Dedicated Student',
    description: 'Watch 100 minutes of content',
    icon: '⏰',
    criteria: { type: 'watch_time', value: 100 },
    points: 50,
    category: 'watch',
    rarity: 'rare'
  },
  {
    name: '7-Day Streak',
    description: 'Log in for 7 consecutive days',
    icon: '🔥',
    criteria: { type: 'streak', value: 7 },
    points: 70,
    category: 'streak',
    rarity: 'epic'
  },
  {
    name: 'Social Butterfly',
    description: 'Leave 10 comments',
    icon: '🦋',
    criteria: { type: 'social', value: 10 },
    points: 40,
    category: 'social',
    rarity: 'rare'
  },
  {
    name: 'Legendary Learner',
    description: 'Complete all lessons in a grade',
    icon: '👑',
    criteria: { type: 'special', value: 'complete_grade' },
    points: 100,
    category: 'special',
    rarity: 'legendary'
  }
];

const seedAchievements = async () => {
  try {
    await Achievement.bulkCreate(achievementData);
    console.log('✅ Achievements seeded');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  }
};

module.exports = seedAchievements;