const express = require('express');
const controller = require('../controllers/inquiryController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { inquiryRules, inquiryUpdateRules, idRules } = require('../validators/inquiryValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.post('/', validate(inquiryRules), asyncHandler(controller.createInquiry));
router.get('/', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.listInquiries));
router.get('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.getInquiry));
router.patch('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(inquiryUpdateRules), asyncHandler(controller.updateInquiry));
router.delete('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.deleteInquiry));

module.exports = router;
