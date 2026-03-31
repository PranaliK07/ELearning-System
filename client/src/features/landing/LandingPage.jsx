import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import './landing.css';
import TopBar from './TopBar';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-page">
      <Motion.div className="lp-progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="lp-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </Motion.div>

      <TopBar />
      <Navbar onNavigateToSection={scrollToSection} />
      <Hero onLearnMore={() => scrollToSection('features')} />
      <Features />
      <About />
      <Contact />
      <Footer onNavigateToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;
