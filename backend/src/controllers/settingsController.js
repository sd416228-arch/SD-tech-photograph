const pool = require('../config/database');

async function getSettings(req, res) {
  const result = await pool.query('SELECT * FROM business_settings WHERE id = 1');
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Business settings not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function getPublicSettings(req, res) {
  const result = await pool.query('SELECT business_name, phone, email, address, instagram_url, facebook_url, tiktok_url, about_text FROM business_settings WHERE id = 1');
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Business settings not found' });
  return res.json({ success: true, data: result.rows[0] });
}

async function updateSettings(req, res) {
  const current = await pool.query('SELECT * FROM business_settings WHERE id = 1');
  if (!current.rows[0]) return res.status(404).json({ success: false, message: 'Business settings not found' });
  const settings = { ...current.rows[0], ...req.body };
  const { business_name: businessName, phone, email, address, instagram_url: instagramUrl, facebook_url: facebookUrl, tiktok_url: tiktokUrl, about_text: aboutText } = settings;
  const result = await pool.query(
    `INSERT INTO business_settings (id, business_name, phone, email, address, instagram_url, facebook_url, tiktok_url, about_text)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name, phone = EXCLUDED.phone, email = EXCLUDED.email, address = EXCLUDED.address, instagram_url = EXCLUDED.instagram_url, facebook_url = EXCLUDED.facebook_url, tiktok_url = EXCLUDED.tiktok_url, about_text = EXCLUDED.about_text
     RETURNING *`,
    [businessName, phone || null, email || null, address || null, instagramUrl || null, facebookUrl || null, tiktokUrl || null, aboutText || null],
  );
  return res.json({ success: true, data: result.rows[0] });
}

module.exports = { getSettings, getPublicSettings, updateSettings };
