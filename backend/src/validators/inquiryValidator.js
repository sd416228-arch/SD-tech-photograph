const { body, param } = require('express-validator');

const inquiryRules = [
  body('name').trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (up to 120 characters)'),
  body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('phone').trim().isLength({ min: 5, max: 40 }).withMessage('Phone number is required (5 to 40 characters)'),
  body('service').trim().isLength({ min: 1, max: 120 }).withMessage('Service selection is required'),
  body('preferred_date').optional({ values: 'falsy' }).isISO8601().withMessage('Preferred date must be a valid date (YYYY-MM-DD)'),
  body('message').trim().isLength({ min: 1, max: 3000 }).withMessage('Message is required (up to 3000 characters)'),
];

const inquiryUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('Inquiry id must be a positive integer'),
  body('status').isIn(['NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid inquiry status'),
];

const idRules = [param('id').isInt({ min: 1 }).withMessage('Id must be a positive integer')];

module.exports = { inquiryRules, inquiryUpdateRules, idRules };
