import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  EmailOutlined,
  LocationOnOutlined,
  PersonOutline,
  PhoneInTalkOutlined,
  SendOutlined,
  WhatsApp,
  ScheduleOutlined,
} from '@mui/icons-material';

const contactItems = [
  {
    icon: PhoneInTalkOutlined,
    label: 'Phone',
    value: '+1 (800) 555-0123',
    href: 'tel:+18005550123',
  },
  {
    icon: WhatsApp,
    label: 'WhatsApp',
    value: 'Chat with our team',
    href: 'https://wa.me/18005550123?text=Hi%20I%20want%20to%20learn%20more%20about%20the%20kids%20platform.',
  },
  {
    icon: EmailOutlined,
    label: 'Email',
    value: 'support@kidslearn.com',
    href: 'mailto:support@kidslearn.com',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Thanks! We will reach out soon.');
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <section id="contact" className="lp-section">
      <div className="lp-container">
        <Motion.div
          className="lp-kicker"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
        >
          <SendOutlined fontSize="small" />
          Let&apos;s talk
        </Motion.div>

        <Motion.h2
          className="lp-title"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', marginTop: 16 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          Ready to make learning <span className="lp-title-gradient">more joyful</span>?
        </Motion.h2>

        <Motion.p
          className="lp-subtitle"
          style={{ maxWidth: 720, marginTop: 14 }}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Send a message and we&apos;ll help you explore lessons, pricing, support, or onboarding for your child.
        </Motion.p>

        <div className="lp-contact-grid" style={{ marginTop: 28 }}>
          <Motion.div
            className="lp-contact-card"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <form className="lp-form-grid" onSubmit={handleSubmit}>
              <div className="lp-field">
                <PersonOutline className="lp-field-icon" fontSize="small" />
                <input
                  className="lp-input"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lp-field">
                <EmailOutlined className="lp-field-icon" fontSize="small" />
                <input
                  className="lp-input"
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lp-field">
                <ScheduleOutlined className="lp-field-icon" fontSize="small" />
                <textarea
                  className="lp-textarea"
                  name="message"
                  placeholder="Tell us what you need"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Motion.button
                type="submit"
                className="lp-primary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 10 }}
              >
                <SendOutlined fontSize="small" />
                Send Message
              </Motion.button>
            </form>
          </Motion.div>

          <div className="lp-contact-side">
            <Motion.div
              className="lp-contact-info"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <h3 className="lp-title" style={{ fontSize: '1.8rem', marginBottom: 8 }}>
                Contact info
              </h3>
              <p className="lp-subtitle" style={{ fontSize: '1rem' }}>
                Reach out by phone, WhatsApp, or email. We usually respond quickly during school hours.
              </p>

              <div className="lp-contact-list">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Motion.a
                      key={item.label}
                      href={item.href}
                      className="lp-contact-row"
                      whileHover={{ x: 5, scale: 1.01 }}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      <span
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 16,
                          display: 'grid',
                          placeItems: 'center',
                          background: 'rgba(77,150,255,0.12)',
                          color: '#4d96ff',
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </span>
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.value}</span>
                      </div>
                    </Motion.a>
                  );
                })}
              </div>
            </Motion.div>

            <Motion.div
              className="lp-contact-info"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: 0.16 }}
            >
              <div className="lp-pill" style={{ background: 'rgba(255,255,255,0.86)', marginBottom: 14 }}>
                <LocationOnOutlined fontSize="small" />
                <span>Available worldwide for families and schools</span>
              </div>
              <p className="lp-subtitle" style={{ fontSize: '1rem' }}>
                We&apos;re happy to guide you through setup, curriculum fit, and the best learning path for your child.
              </p>
            </Motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
