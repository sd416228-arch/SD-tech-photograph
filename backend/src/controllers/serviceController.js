const pool = require('../config/database');

async function listServices(req, res) {
  const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
  return res.json({ success: true, data: result.rows });
}

async function getService(req, res) {
  const result = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function createService(req, res) {
  const { title, description, image_url: imageUrl, is_active: isActive = true } = req.body;
  const result = await pool.query('INSERT INTO services (title, description, image_url, is_active) VALUES ($1, $2, $3, $4) RETURNING *', [title, description, imageUrl || null, isActive]);
  return res.status(201).json({ success: true, data: result.rows[0] });
}

async function updateService(req, res) {
  const { title, description, image_url: imageUrl, is_active: isActive } = req.body;
  const result = await pool.query('UPDATE services SET title = COALESCE($1, title), description = COALESCE($2, description), image_url = COALESCE($3, image_url), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *', [title, description, imageUrl, isActive, req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function deleteService(req, res) {
  const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
  return res.json({ success: true, data: { id: result.rows[0].id } });
}

module.exports = { listServices, getService, createService, updateService, deleteService };
