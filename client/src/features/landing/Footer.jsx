import React from 'react';
import { motion as Motion } from 'framer-motion';
import { WhatsApp, EmailOutlined, ArrowForward, LocationOnOutlined } from '@mui/icons-material';

const quickLinks = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

const Footer = ({ onNavigateToSection }) => {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" width="100%" height="120" preserveAspectRatio="none">
          <path
            d="M0,64 C240,120 480,8 720,48 C960,88 1200,120 1440,48 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <div className="lp-footer-inner">
        <div className="lp-footer-grid">
          <div>
            <h4>eLearning for Kids</h4>
            <p>
              A joyful, colorful learning space for Class 1-5 children. Built to feel fun, safe, and easy for
              families who want more confidence in early education.
            </p>
            <div className="lp-socials">
              <Motion.a
                href="https://wa.me/18005550123?text=Hi%20I%20want%20to%20learn%20more%20about%20the%20kids%20learning%20platform."
                className="lp-social"
                whileHover={{ y: -4, scale: 1.06 }}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsApp />
              </Motion.a>
              <Motion.a
                href="mailto:support@kidslearn.com"
                className="lp-social"
                whileHover={{ y: -4, scale: 1.06 }}
                aria-label="Email"
              >
                <EmailOutlined />
              </Motion.a>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <div className="lp-footer-links">
              {quickLinks.map((item) => (
                <Motion.button
                  key={item.id}
                  type="button"
                  className="lp-footer-link"
                  onClick={() => onNavigateToSection(item.id)}
                  whileHover={{ x: 6 }}
                  style={{ textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer' }}
                >
                  <ArrowForward fontSize="small" />
                  <span>{item.label}</span>
                </Motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4>Contact</h4>
            <div className="lp-footer-links">
              <a className="lp-footer-link" href="tel:+18005550123">
                <ArrowForward fontSize="small" />
                <span>+1 (800) 555-0123</span>
              </a>
              <a className="lp-footer-link" href="mailto:support@kidslearn.com">
                <ArrowForward fontSize="small" />
                <span>support@kidslearn.com</span>
              </a>
              <a
                className="lp-footer-link"
                href="https://www.google.com/maps?q=Delhi,+India"
                target="_blank"
                rel="noreferrer"
              >
                <LocationOnOutlined fontSize="small" />
                <span>Delhi, India</span>
              </a>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} eLearning for Kids. All rights reserved.</span>
          <span>Built for curious little learners.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
