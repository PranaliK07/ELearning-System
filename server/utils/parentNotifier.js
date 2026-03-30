const sendEmail = require('./sendEmail');

const sendParentNotification = async ({ email, message, subject = 'Assignment Reminder' }) => {
  if (!email || !message) {
    return { sent: false, reason: 'missing_email_or_message' };
  }

  try {
    await sendEmail({
      to: email,
      subject,
      data: { message }
    });
    return { sent: true };
  } catch (error) {
    console.error('Parent notification error:', error);
    return { sent: false, reason: 'send_failed' };
  }
};

module.exports = { sendParentNotification };
