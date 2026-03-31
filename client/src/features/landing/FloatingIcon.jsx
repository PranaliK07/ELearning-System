import React from 'react';
import { motion as Motion } from 'framer-motion';
import { AutoAwesome } from '@mui/icons-material';

const themes = {
  sunrise: {
    gradient: 'linear-gradient(135deg, #ffd24a 0%, #ff7a59 52%, #ff5ca8 100%)',
    glow: 'rgba(255, 122, 89, 0.32)',
  },
  sky: {
    gradient: 'linear-gradient(135deg, #4f7cff 0%, #27c59a 100%)',
    glow: 'rgba(79, 124, 255, 0.28)',
  },
  candy: {
    gradient: 'linear-gradient(135deg, #ff7a59 0%, #ffd24a 55%, #ff5ca8 100%)',
    glow: 'rgba(255, 92, 168, 0.26)',
  },
};

const sparkles = [
  { top: '14%', left: '18%', size: 14, delay: 0 },
  { top: '22%', right: '14%', size: 12, delay: 0.45 },
  { bottom: '18%', left: '20%', size: 10, delay: 0.9 },
  { bottom: '22%', right: '18%', size: 13, delay: 1.25 },
];

const FloatingIcon = ({
  icon,
  color = 'sunrise',
  size = 172,
  className = '',
  label = 'Floating learning icon',
}) => {
  const IconComponent = icon || AutoAwesome;
  const theme = themes[color] ?? themes.sunrise;
  const iconMarkup = (
    <IconComponent
      style={{
        fontSize: Math.round(size * 0.46),
        color: '#ffffff',
        filter: 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.18))',
      }}
    />
  );

  return (
    <Motion.div
      className={className}
      role="img"
      aria-label={label}
      animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.1 }}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '9999px',
        display: 'grid',
        placeItems: 'center',
        background: theme.gradient,
        boxShadow: `0 24px 45px ${theme.glow}, inset 0 0 0 1px rgba(255, 255, 255, 0.32)`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.16, 1], opacity: [0.45, 0.72, 0.45] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '14%',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.18)',
          filter: 'blur(1px)',
        }}
      />

      {sparkles.map((sparkle) => (
        <Motion.span
          key={`${sparkle.top ?? sparkle.bottom}-${sparkle.left ?? sparkle.right}`}
          aria-hidden="true"
          animate={{ y: [0, -18, -32], opacity: [0, 1, 0], scale: [0.7, 1, 0.7] }}
          transition={{
            duration: 2.4,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: sparkle.top,
            right: sparkle.right,
            bottom: sparkle.bottom,
            left: sparkle.left,
            fontSize: sparkle.size,
            color: '#ffffff',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
          }}
        >
          {'✦'}
        </Motion.span>
      ))}

      <Motion.div
        aria-hidden="true"
        animate={{ y: [0, -5, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          placeItems: 'center',
          width: '68%',
          height: '68%',
          borderRadius: '42px',
          background: 'rgba(255, 255, 255, 0.16)',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {iconMarkup}
      </Motion.div>
    </Motion.div>
  );
};

export default FloatingIcon;
