const express = require('express');
const controller = require('../controllers/settingsController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { settingsRules } = require('../validators/contentValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/public', asyncHandler(controller.getPublicSettings));
router.get('/', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.getSettings));
router.patch('/', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(settingsRules), asyncHandler(controller.updateSettings));

module.exports = router;
