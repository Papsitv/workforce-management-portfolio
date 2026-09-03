const jwt = require('jsonwebtoken');

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'lealdennis110@gmail.com';
const SITE_URL = process.env.SITE_URL || 'https://papsitv.github.io/workforce-management-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

module.exports = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('Missing token');
    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); } catch (e) { return res.status(400).send('Invalid or expired token'); }

    // If token is valid and action is resume, redirect to resume PDF
    if (payload.action === 'resume') {
      const resumeUrl = `${SITE_URL.replace(/\/$/, '')}/resume.pdf`;
      return res.redirect(302, resumeUrl);
    }

    // For meeting confirmations, simply show a thank-you page
    return res.status(200).send('<h1>Request confirmed</h1><p>Your request has been sent. Thank you.</p>');
  } catch (err) {
    console.error('confirm error', err && err.message);
    return res.status(500).send('Server error');
  }
};
