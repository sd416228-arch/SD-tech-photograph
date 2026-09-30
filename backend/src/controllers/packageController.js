const pool = require('../config/database');

async function listPackages(req, res) {
  const result = await pool.query('SELECT * FROM packages ORDER BY price ASC');
  return res.json({ success: true, data: result.rows });
}

async function getPackage(req, res) {
  const result = await pool.query('SELECT * FROM packages WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Package not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function createPackage(req, res) {
  const { name, description, price, features, is_active: isActive = true } = req.body;
  const result = await pool.query('INSERT INTO packages (name, description, price, features, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, price, JSON.stringify(features), isActive]);
  return res.status(201).json({ success: true, data: result.rows[0] });
}

async function updatePackage(req, res) {
  const { name, description, price, features, is_active: isActive } = req.body;
  const result = await pool.query('UPDATE packages SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), features = COALESCE($4::jsonb, features), is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *', [name, description, price, features === undefined ? null : JSON.stringify(features), isActive, req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Package not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function deletePackage(req, res) {
  const result = await pool.query('DELETE FROM packages WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Package not found' });
  return res.json({ success: true, data: { id: result.rows[0].id } });
}

module.exports = { listPackages, getPackage, createPackage, updatePackage, deletePackage };
