const express = require('express');
const controller = require('../controllers/reviewController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { reviewRules, reviewPatchRules, idRules } = require('../validators/contentValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.listReviews));
router.get('/admin', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.listAdminReviews));
router.post('/', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(reviewRules), asyncHandler(controller.createReview));
router.patch('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate([...idRules, ...reviewPatchRules]), asyncHandler(controller.updateReview));
router.delete('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.deleteReview));

module.exports = router;
