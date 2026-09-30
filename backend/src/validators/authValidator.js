const { body } = require('express-validator');

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8, max: 120 }).withMessage('Password must be 8 to 120 characters'),
];

module.exports = { loginRules };
