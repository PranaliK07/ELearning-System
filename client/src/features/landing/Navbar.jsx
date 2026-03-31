import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Menu, Close, ArrowForward, SchoolOutlined, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

const Navbar = ({ onNavigateToSection }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => {
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <div className="lp-navbar">
      <Motion.div
        className="lp-navbar-inner lp-glass"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <button
          type="button"
          className="lp-brand"
          onClick={() => onNavigateToSection('home')}
          aria-label="Go to home"
        >
          <span className="lp-brand-mark">
            <SchoolOutlined />
          </span>
          <span>eLearning for Kids</span>
        </button>

        <nav className="lp-nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="lp-nav-link"
              onClick={() => onNavigateToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="lp-nav-link" onClick={() => navigate('/login')}>
            Login
          </button>
        </nav>

        <div className="lp-nav-cta">
          <Motion.button
            type="button"
            className="lp-primary-btn"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={goToLogin}
          >
            Start Learning
          </Motion.button>
        </div>

        <button
          type="button"
          className="lp-mobile-trigger"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <Close /> : <Menu />}
        </button>
      </Motion.div>

      <AnimatePresence>
        {menuOpen ? (
          <Motion.div
            className="lp-mobile-menu lp-glass"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28 }}
            style={{
              borderRadius: 28,
              padding: 18,
            }}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="lp-pill"
                  onClick={() => {
                    onNavigateToSection(item.id);
                    setMenuOpen(false);
                  }}
                  style={{ justifyContent: 'space-between', width: '100%' }}
                >
                  <span>{item.label}</span>
                  <ArrowForward fontSize="small" />
                </button>
              ))}
              <button type="button" className="lp-primary-btn" onClick={goToLogin} style={{ width: '100%' }}>
                <LoginIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Login
              </button>
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
