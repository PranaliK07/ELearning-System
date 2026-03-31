import React from 'react';
import { motion as Motion } from 'framer-motion';
import { CheckCircle, School, FavoriteBorder, EmojiEvents } from '@mui/icons-material';

const bullets = [
  {
    title: 'Made for early learners',
    text: 'Simple instructions, friendly visuals, and step-by-step activities keep Class 1-5 learners comfortable.',
  },
  {
    title: 'Helpful for parents',
    text: 'Clear progress hints and gentle learning paths make it easy to support study time at home.',
  },
  {
    title: 'Built for confidence',
    text: 'Small wins, badges, and playful repetition help children feel proud after every session.',
  },
];

const About = () => {
  return (
    <section id="about" className="lp-section">
      <div className="lp-container">
        <div className="lp-about-grid">
          <Motion.div
            className="lp-about-visual"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lp-illustration-shell">
              <div className="lp-illustration-stage">
                <Motion.div
                  className="lp-illustration-figure"
                  animate={{ y: [0, -10, 0], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                <Motion.div
                  className="lp-illustration-badge one"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <School fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#4d96ff' }} />
                  Learn by doing
                </Motion.div>

                <Motion.div
                  className="lp-illustration-badge two"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FavoriteBorder fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#ff8e3c' }} />
                  Kid approved
                </Motion.div>

                <Motion.div
                  className="lp-illustration-badge three"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <EmojiEvents fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#6bcb77' }} />
                  Little victories
                </Motion.div>
              </div>
            </div>
          </Motion.div>

          <div>
            <Motion.div
              className="lp-kicker"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45 }}
            >
              <CheckCircle fontSize="small" />
              About the platform
            </Motion.div>

            <Motion.h2
              className="lp-title"
              style={{ fontSize: 'clamp(2.1rem, 5vw, 4rem)', marginTop: 16 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              A happy place where early learning <span className="lp-title-gradient">feels easy</span>
            </Motion.h2>

            <Motion.p
              className="lp-subtitle"
              style={{ marginTop: 14 }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              We designed this space to look and feel like a warm learning companion. It blends playful visuals,
              guided practice, and clear progress so children can build confidence while parents stay informed.
            </Motion.p>

            <div className="lp-check-list">
              {bullets.map((bullet, index) => (
                <Motion.div
                  key={bullet.title}
                  className="lp-check-item"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.08 * index }}
                  whileHover={{ x: 4, scale: 1.01 }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 14,
                      display: 'grid',
                      placeItems: 'center',
                      background:
                        index === 0
                          ? 'rgba(77,150,255,0.16)'
                          : index === 1
                            ? 'rgba(255,142,60,0.16)'
                            : 'rgba(107,203,119,0.16)',
                      color: index === 0 ? '#4d96ff' : index === 1 ? '#ff8e3c' : '#6bcb77',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle fontSize="small" />
                  </span>
                  <div>
                    <strong>{bullet.title}</strong>
                    <span>{bullet.text}</span>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
