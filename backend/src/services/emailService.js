const nodemailer = require('nodemailer');

function getTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_PORT) === '465',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
}

async function sendInquiryNotification(inquiry) {
  const transporter = getTransporter();
  if (!transporter || !process.env.OWNER_EMAIL) {
    console.info('Email notification skipped: email configuration is incomplete.');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: `New SD Tech Photograph inquiry from ${inquiry.name}`,
    text: [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone}`,
      `Service: ${inquiry.service}`,
      `Preferred date: ${inquiry.preferred_date || 'Not specified'}`,
      '',
      inquiry.message,
    ].join('\n'),
  });
}

module.exports = { sendInquiryNotification };
