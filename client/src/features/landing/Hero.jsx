import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  AutoStories,
  RocketLaunch,
  Star,
  Draw,
  PlayCircle,
  AutoAwesome,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingIcon from './FloatingIcon';

const stats = [
  { value: '500+', label: 'Kid-friendly activities' },
  { value: '5', label: 'Learning tracks' },
  { value: '100%', label: 'Safe and parent-friendly' },
];

const heroBadges = [
  { icon: <AutoStories fontSize="small" />, label: 'Reading adventures' },
  { icon: <PlayCircle fontSize="small" />, label: 'Play-based lessons' },
  { icon: <Draw fontSize="small" />, label: 'Creative practice' },
];

const storyTiles = [
  {
    className: 'book',
    icon: AutoStories,
    title: 'Story Time',
    subtitle: 'Read together',
    accent: '#ffd24a',
  },
  {
    className: 'rocket',
    icon: RocketLaunch,
    title: 'Mission Mode',
    subtitle: 'Level up fast',
    accent: '#4f7cff',
  },
  {
    className: 'star',
    icon: Star,
    title: 'Star Rewards',
    subtitle: 'Collect wins',
    accent: '#27c59a',
  },
  {
    className: 'pencil',
    icon: Draw,
    title: 'Write & Draw',
    subtitle: 'Make it fun',
    accent: '#ff7a59',
  },
];

const heroNotes = [
  {
    icon: RocketLaunch,
    title: 'Adventure starts now',
    subtitle: 'Learning rockets off!',
    themeClass: 'theme-rocket',
    accent: 'rgba(79, 124, 255, 0.18)',
    badge: '#4f7cff',
  },
  {
    icon: EmojiEvents,
    title: 'Celebrate every win',
    subtitle: 'Reward stars unlocked',
    themeClass: 'theme-star',
    accent: 'rgba(255, 210, 74, 0.20)',
    badge: '#ff7a59',
  },
];

const Hero = ({ onLearnMore }) => {
  const navigate = useNavigate();

  return (
    <section id="home" className="lp-section lp-hero">
      <div className="lp-container">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <Motion.div
              className="lp-kicker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✦
              </Motion.span>
              Class 1-5 learning that feels like play
            </Motion.div>

            <Motion.h1
              className="lp-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Fun Learning for <span className="lp-title-gradient">Young Minds</span>
            </Motion.h1>

            <Motion.p
              className="lp-subtitle"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
            >
              A bright, game-like eLearning world where kids practice reading, math, and curiosity through
              stories, quizzes, rewards, and colorful progress moments parents can trust.
            </Motion.p>

            <Motion.div
              className="lp-hero-actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
            >
              <Motion.button
                type="button"
                className="lp-primary-btn"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
              >
                Start Learning
              </Motion.button>
              <Motion.button
                type="button"
                className="lp-secondary-btn"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLearnMore}
              >
                Explore Features
              </Motion.button>
              <Motion.button
                type="button"
                className="lp-primary-btn"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
              >
                Start Free Demo
              </Motion.button>
            </Motion.div>

            <div className="lp-badge-row">
              {heroBadges.map((badge) => (
                <Motion.div
                  key={badge.label}
                  className="lp-pill"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </Motion.div>
              ))}
            </div>

            <div className="lp-hero-stats">
              {stats.map((stat, index) => (
                <Motion.div
                  key={stat.label}
                  className="lp-stat"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 * index }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </Motion.div>
              ))}
            </div>
          </div>

          <div className="lp-hero-art">
            <Motion.div
              className="lp-hero-orb one"
              animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Motion.div
              className="lp-hero-orb two"
              animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />

            <Motion.div
              className="lp-hero-card"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="lp-hero-card-glow one" />
              <div className="lp-hero-card-glow two" />

              <Motion.div
                className="lp-storyboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                <div className="lp-storyboard-header">
                  <Motion.div
                    className="lp-storyboard-badge"
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AutoStories fontSize="small" />
                    Storybook Zone
                  </Motion.div>
                  <div className="lp-storyboard-title-row">
                    <h3>Adventure starts now</h3>
                    <span>Learning rockets off!</span>
                  </div>
                </div>

                <Motion.div
                  className="lp-storyboard-stage"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="lp-stage-cloud cloud-one" />
                  <div className="lp-stage-cloud cloud-two" />

                  <FloatingIcon icon={AutoStories} color="sunrise" size={172} label="Floating learning icon" />
                </Motion.div>

                <div className="lp-storyboard-grid">
                  {storyTiles.map((tile, index) => {
                    const Icon = tile.icon;

                    return (
                      <Motion.article
                        key={tile.title}
                        className={`lp-floating-card ${tile.className}`}
                        animate={{
                          y: [0, -6 - index * 2, 0],
                          rotate: index % 2 === 0 ? [-1, 1, -1] : [1, -1, 1],
                        }}
                        transition={{ duration: 3 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.03, y: -8 }}
                      >
                        <span
                          className="lp-floating-icon"
                          aria-hidden="true"
                          style={{ color: tile.accent }}
                        >
                          <Icon />
                        </span>
                        <div className="lp-floating-copy">
                          <strong className="lp-floating-title">{tile.title}</strong>
                          <span className="lp-floating-subtitle">{tile.subtitle}</span>
                        </div>
                      </Motion.article>
                    );
                  })}
                </div>

                <div className="lp-storyboard-footer">
                  <div className="lp-storyboard-footer-label">
                    <AutoAwesome fontSize="small" />
                    Reward quest
                  </div>
                  {heroNotes.map((note, index) => {
                    const Icon = note.icon;

                    return (
                      <Motion.div
                        key={note.title}
                        className={`lp-storyboard-note ${note.themeClass}`}
                        animate={{ y: [0, index % 2 === 0 ? -4 : 4, 0] }}
                        transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ '--note-accent': note.accent, '--note-badge': note.badge }}
                      >
                        <span className="lp-storyboard-note-icon">
                          <Icon fontSize="small" />
                        </span>
                        <div>
                          <strong>{note.title}</strong>
                          <span>{note.subtitle}</span>
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              </Motion.div>
            </Motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
