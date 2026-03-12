const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  // If email is not configured or still using default placeholder, skip it
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_email') || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email not configured in .env. Skipping email to:', options.to);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: `"E-Learning Platform" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || getTemplate(options.template, options.data)
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    logger.error('Email send error:', error);
    // Don't throw error here to avoid crashing the main process
    return { success: false, error: error.message };
  }
};

const getTemplate = (template, data) => {
  switch (template) {
    case 'welcome':
    case 'verification':
      return `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Welcome ${data.name}! 🎓</h2>
          <p>Thank you for joining our E-Learning platform. We are excited to have you!</p>
          <div style="margin: 30px 0;">
            <a href="${data.verificationUrl}" style="background: #3f51b5; color: white; padding: 12px 25px; text-decoration: none; borderRadius: 5px;">Verify Your Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link:</p>
          <p>${data.verificationUrl}</p>
        </div>
      `;

    case 'resetPassword':
      return `
        <h1>Password Reset Request</h1>
        <p>Hi ${data.name},</p>
        <p>Click <a href="${data.resetUrl}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
      `;

    case 'achievement':
      return `
        <h1>Congratulations ${data.name}! 🎉</h1>
        <p>You've earned a new achievement: <strong>${data.achievement}</strong></p>
        <p>You earned ${data.points} points!</p>
      `;

    default:
      return data.message || 'Email from E-Learning Platform';
  }
};

module.exports = sendEmail;