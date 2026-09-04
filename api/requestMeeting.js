const sgMail = (() => {
  try { return require('@sendgrid/mail'); } catch (e) { return null; }
})();
const jwt = (() => {
  try { return require('jsonwebtoken'); } catch (e) { return null; }
})();

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'lealdennis110@gmail.com';
const SITE_URL = process.env.SITE_URL || 'https://papsitv.github.io/workforce-management-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

if (sgMail && process.env.SENDGRID_API_KEY) {
  try { sgMail.setApiKey(process.env.SENDGRID_API_KEY); } catch (e) { console.warn('Failed to set SendGrid API key', e && e.message); }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, phone, datetime, message, action } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // If SendGrid is configured, perform the original email flows.
    if (sgMail && process.env.SENDGRID_API_KEY && jwt) {
      // Notify owner immediately about meeting request
      if (action === 'meeting') {
        const ownerMsg = {
          to: OWNER_EMAIL,
          from: OWNER_EMAIL,
          subject: `Meeting request from ${name || email}`,
          text: `Meeting request details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nPreferred: ${datetime || ''}\n\nMessage:\n${message || ''}`
        };
        await sgMail.send(ownerMsg);
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
    }

    // FALLBACK: no SendGrid configured — log request and return a direct resume download when requested.
    console.log('requestMeeting (no-sendgrid) received', { name, email, phone, datetime, message, action });

    if (action === 'resume') {
      // Return a direct download URL (no verification) so client can proceed.
      return res.status(200).json({ ok: true, resumeReady: true, resumeUrl: `${SITE_URL.replace(/\/$/, '')}/resume.pdf` });
    }

    // For meeting action, just acknowledge (owner alert disabled without SendGrid)
    return res.status(200).json({ ok: true, note: 'No email provider configured; owner notification skipped.' });
  } catch (err) {
    console.error('requestMeeting error', err && err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};
