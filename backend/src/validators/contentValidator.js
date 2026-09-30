const { body, param } = require('express-validator');

const idRules = [param('id').isInt({ min: 1 }).withMessage('Id must be a positive integer')];

const serviceRules = [
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2 to 150 characters'),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10 to 3000 characters'),
  body('image_url').optional({ values: 'null' }).isURL().withMessage('Image URL must be valid'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean').toBoolean(),
];

const servicePatchRules = [
  body('title').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2 to 150 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10 to 3000 characters'),
  body('image_url').optional({ values: 'null' }).isURL().withMessage('Image URL must be valid'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean').toBoolean(),
];

const packageRules = [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2 to 150 characters'),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10 to 3000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be zero or greater').toFloat(),
  body('features').isArray({ max: 30 }).withMessage('Features must be an array with at most 30 items'),
  body('features.*').trim().isLength({ min: 1, max: 200 }).withMessage('Each feature must be 1 to 200 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean').toBoolean(),
];

const packagePatchRules = [
  body('name').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2 to 150 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10 to 3000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be zero or greater').toFloat(),
  body('features').optional().isArray({ max: 30 }).withMessage('Features must be an array with at most 30 items'),
  body('features.*').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Each feature must be 1 to 200 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean').toBoolean(),
];

const reviewRules = [
  body('customer_name').trim().isLength({ min: 2, max: 120 }).withMessage('Customer name must be 2 to 120 characters'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
  body('review_text').trim().isLength({ min: 10, max: 3000 }).withMessage('Review must be 10 to 3000 characters'),
  body('is_approved').optional().isBoolean().withMessage('is_approved must be boolean').toBoolean(),
];

const reviewPatchRules = [
  body('customer_name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Customer name must be 2 to 120 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
  body('review_text').optional().trim().isLength({ min: 10, max: 3000 }).withMessage('Review must be 10 to 3000 characters'),
  body('is_approved').optional().isBoolean().withMessage('is_approved must be boolean').toBoolean(),
];

const galleryRules = [
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2 to 150 characters'),
  body('image_url').trim().isURL().withMessage('A valid image URL is required'),
  body('category').trim().isLength({ min: 2, max: 80 }).withMessage('Category must be 2 to 80 characters'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be boolean').toBoolean(),
];

const galleryPatchRules = [
  body('title').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2 to 150 characters'),
  body('image_url').optional().trim().isURL().withMessage('A valid image URL is required'),
  body('category').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Category must be 2 to 80 characters'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be boolean').toBoolean(),
];

const settingsRules = [
  body('business_name').trim().isLength({ min: 2, max: 180 }).withMessage('Business name must be 2 to 180 characters'),
  body('phone').optional({ values: 'null' }).trim().isLength({ max: 40 }).withMessage('Phone is too long'),
  body('email').optional({ values: 'null' }).isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('address').optional({ values: 'null' }).trim().isLength({ max: 500 }).withMessage('Address is too long'),
  body('instagram_url').optional({ values: 'null' }).isURL().withMessage('Instagram URL must be valid'),
  body('facebook_url').optional({ values: 'null' }).isURL().withMessage('Facebook URL must be valid'),
  body('tiktok_url').optional({ values: 'null' }).isURL().withMessage('TikTok URL must be valid'),
  body('about_text').optional({ values: 'null' }).trim().isLength({ max: 5000 }).withMessage('About text is too long'),
];

module.exports = { idRules, serviceRules, servicePatchRules, packageRules, packagePatchRules, reviewRules, reviewPatchRules, galleryRules, galleryPatchRules, settingsRules };
