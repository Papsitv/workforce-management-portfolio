const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'lealdennis110@gmail.com';
const SITE_URL = process.env.SITE_URL || 'https://papsitv.github.io/workforce-management-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, phone, datetime, message, action } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Notify owner immediately about meeting request
    if (action === 'meeting') {
      const ownerMsg = {
        to: OWNER_EMAIL,
        from: OWNER_EMAIL,
        subject: `Meeting request from ${name || email}`,
        text: `Meeting request details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nPreferred: ${datetime || ''}\n\nMessage:\n${message || ''}`
      };
      await sgMail.send(ownerMsg);
      // Also send verification email to user (optional) so owner knows contact is real
    }

    // For resume action, send verification email with token
    if (action === 'resume' || action === 'meeting') {
      const token = jwt.sign({ email, action }, JWT_SECRET, { expiresIn: '24h' });
      const confirmUrl = `${SITE_URL.replace(/\/$/, '')}/api/confirm?token=${token}`;

      const userMsg = {
        to: email,
        from: OWNER_EMAIL,
        subject: 'Confirm your request',
        text: `Please confirm your request by visiting: ${confirmUrl}\n\nThis link expires in 24 hours.`,
        html: `<p>Please confirm your request by clicking the link below:</p><p><a href="${confirmUrl}">Confirm request</a></p><p>This link expires in 24 hours.</p>`
      };
      await sgMail.send(userMsg);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('requestMeeting error', err && err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};
