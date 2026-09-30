const pool = require('../config/database');

async function listGallery(req, res) {
  const values = [];
  let query = 'SELECT * FROM gallery';
  if (req.query.category) {
    values.push(req.query.category);
    query += ' WHERE category = $1';
  }
  query += ' ORDER BY is_featured DESC, created_at DESC';
  const result = await pool.query(query, values);
  return res.json({ success: true, data: result.rows });
}

async function getGalleryItem(req, res) {
  const result = await pool.query('SELECT * FROM gallery WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Gallery item not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function createGalleryItem(req, res) {
  const { title, image_url: imageUrl, category, is_featured: isFeatured = false } = req.body;
  const result = await pool.query('INSERT INTO gallery (title, image_url, category, is_featured) VALUES ($1, $2, $3, $4) RETURNING *', [title, imageUrl, category, isFeatured]);
  return res.status(201).json({ success: true, data: result.rows[0] });
}

async function updateGalleryItem(req, res) {
  const { title, image_url: imageUrl, category, is_featured: isFeatured } = req.body;
  const result = await pool.query('UPDATE gallery SET title = COALESCE($1, title), image_url = COALESCE($2, image_url), category = COALESCE($3, category), is_featured = COALESCE($4, is_featured) WHERE id = $5 RETURNING *', [title, imageUrl, category, isFeatured, req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Gallery item not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function deleteGalleryItem(req, res) {
  const result = await pool.query('DELETE FROM gallery WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Gallery item not found' });
  return res.json({ success: true, data: { id: result.rows[0].id } });
}

module.exports = { listGallery, getGalleryItem, createGalleryItem, updateGalleryItem, deleteGalleryItem };
