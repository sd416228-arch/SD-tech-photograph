require('dotenv').config();

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function seed() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before running npm run seed');
  }

  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8'));

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, $4)
    ON CONFLICT ((LOWER(email))) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [process.env.ADMIN_NAME || 'PicturesSquad Owner', process.env.ADMIN_EMAIL, passwordHash, process.env.ADMIN_ROLE || 'OWNER'],
  );

  console.log('Database schema and development data seeded successfully.');
}

seed().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
}).finally(() => pool.end());
