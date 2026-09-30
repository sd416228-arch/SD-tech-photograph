const pool = require('../config/database');

async function listReviews(req, res) {
  const result = await pool.query('SELECT * FROM reviews WHERE is_approved = TRUE ORDER BY created_at DESC');
  return res.json({ success: true, data: result.rows });
}

async function listAdminReviews(req, res) {
  const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
  return res.json({ success: true, data: result.rows });
}

async function createReview(req, res) {
  const { customer_name: customerName, rating, review_text: reviewText, is_approved: isApproved = false } = req.body;
  const result = await pool.query('INSERT INTO reviews (customer_name, rating, review_text, is_approved) VALUES ($1, $2, $3, $4) RETURNING *', [customerName, rating, reviewText, isApproved]);
  return res.status(201).json({ success: true, data: result.rows[0] });
}

async function updateReview(req, res) {
  const { customer_name: customerName, rating, review_text: reviewText, is_approved: isApproved } = req.body;
  const result = await pool.query('UPDATE reviews SET customer_name = COALESCE($1, customer_name), rating = COALESCE($2, rating), review_text = COALESCE($3, review_text), is_approved = COALESCE($4, is_approved) WHERE id = $5 RETURNING *', [customerName, rating, reviewText, isApproved, req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function deleteReview(req, res) {
  const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
  return res.json({ success: true, data: { id: result.rows[0].id } });
}

module.exports = { listReviews, listAdminReviews, createReview, updateReview, deleteReview };
