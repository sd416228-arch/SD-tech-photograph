const pool = require('../config/database');
const { sendInquiryNotification } = require('../services/emailService');

async function createInquiry(req, res) {
  const { name, email, phone, service, preferred_date: preferredDate, message } = req.body;
  const cleanDate = preferredDate && String(preferredDate).trim() ? String(preferredDate).trim() : null;

  const result = await pool.query(
    `INSERT INTO inquiries (name, email, phone, service, preferred_date, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, phone, service, preferred_date, message, status, created_at, updated_at`,
    [name.trim(), email.trim(), phone.trim(), service.trim(), cleanDate, message.trim()],
  );

  const inquiry = result.rows[0];

  // Attempt non-blocking email notification if configured
  try {
    sendInquiryNotification(inquiry).catch((err) => {
      console.error('Email notification failed:', err.message);
    });
  } catch (err) {
    console.error('Email notification dispatch error:', err.message);
  }

  return res.status(201).json({ success: true, data: inquiry });
}

async function listInquiries(req, res) {
  const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
  return res.json({ success: true, data: result.rows });
}

async function getInquiry(req, res) {
  const result = await pool.query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Inquiry not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function updateInquiry(req, res) {
  const result = await pool.query(
    'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
    [req.body.status, req.params.id],
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Inquiry not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function deleteInquiry(req, res) {
  const result = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Inquiry not found' });
  return res.json({ success: true, data: { id: result.rows[0].id } });
}

module.exports = { createInquiry, listInquiries, getInquiry, updateInquiry, deleteInquiry };
