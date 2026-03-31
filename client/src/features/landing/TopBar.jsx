import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  EmailOutlined,
  PhoneInTalkOutlined,
  WhatsApp,
  LocationOnOutlined,
} from '@mui/icons-material';

const contactLinks = [
  {
    label: '+1 (800) 555-0123',
    href: 'tel:+18005550123',
    icon: PhoneInTalkOutlined,
  },
  {
    label: 'WhatsApp us',
    href: 'https://wa.me/18005550123?text=Hi%20I%20want%20to%20know%20more%20about%20the%20kids%20learning%20program.',
    icon: WhatsApp,
  },
  {
    label: 'support@kidslearn.com',
    href: 'mailto:support@kidslearn.com?subject=Kids%20eLearning%20Enquiry',
    icon: EmailOutlined,
  },
  {
    label: 'Delhi, India',
    href: 'https://www.google.com/maps?q=Delhi,+India',
    icon: LocationOnOutlined,
  },
];

const TopBar = () => {
  return (
    <div className="lp-topbar">
      <div className="lp-topbar-inner">
        <Motion.div
          className="lp-pill"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            background: 'rgba(255,255,255,0.14)',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.22)',
          }}
        >
          <Motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✦
          </Motion.span>
          Admissions open for Classes 1-5
        </Motion.div>

        <div className="lp-topbar-links">
          {contactLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Motion.a
                key={item.label}
                href={item.href}
                className="lp-topbar-link"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <Motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon fontSize="small" />
                </Motion.span>
                <span>{item.label}</span>
              </Motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
