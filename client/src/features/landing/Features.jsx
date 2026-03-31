import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  PsychologyAltOutlined,
  QuizOutlined,
  TrendingUpOutlined,
  ShieldOutlined,
  AutoAwesomeOutlined,
} from '@mui/icons-material';

const features = [
  {
    title: 'Interactive Learning',
    icon: PsychologyAltOutlined,
    description: 'Tap, listen, watch, and answer with playful lessons that keep small learners engaged.',
    gradient: 'linear-gradient(135deg, #ffd93d, #ffb347)',
  },
  {
    title: 'Fun Quizzes',
    icon: QuizOutlined,
    description: 'Quick challenges, colorful feedback, and reward moments that make practice feel like a game.',
    gradient: 'linear-gradient(135deg, #4d96ff, #7ab6ff)',
  },
  {
    title: 'Progress Tracking',
    icon: TrendingUpOutlined,
    description: 'Parents can spot growth with simple progress signals, streaks, and friendly milestones.',
    gradient: 'linear-gradient(135deg, #6bcb77, #8fdf8b)',
  },
  {
    title: 'Safe Environment',
    icon: ShieldOutlined,
    description: 'A calm, kid-first space designed for early learners with safe navigation and parent confidence.',
    gradient: 'linear-gradient(135deg, #ff8e3c, #ffb26b)',
  },
];

const Features = () => {
  return (
    <section id="features" className="lp-section">
      <div className="lp-container">
        <Motion.div
          className="lp-kicker"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
        >
          <AutoAwesomeOutlined fontSize="small" />
          Why kids and parents love it
        </Motion.div>

        <Motion.h2
          className="lp-title"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', marginTop: 16 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          Big learning energy, <span className="lp-title-gradient">tiny learner joy</span>
        </Motion.h2>

        <Motion.p
          className="lp-subtitle"
          style={{ maxWidth: 760, marginTop: 14 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Every card is built to feel alive with color, motion, and positive feedback so learners stay curious,
          confident, and excited to come back.
        </Motion.p>

        <div className="lp-feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Motion.article
                key={feature.title}
                className="lp-feature-card"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.5, delay: 0.08 * index }}
                whileHover={{ y: -10, rotate: index % 2 === 0 ? -1.5 : 1.5, scale: 1.02 }}
              >
                <Motion.div
                  className="lp-feature-icon"
                  style={{ background: feature.gradient }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon fontSize="large" />
                </Motion.div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
