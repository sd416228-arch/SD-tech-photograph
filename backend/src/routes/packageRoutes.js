const express = require('express');
const controller = require('../controllers/packageController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { packageRules, packagePatchRules, idRules } = require('../validators/contentValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.listPackages));
router.get('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.getPackage));
router.post('/', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(packageRules), asyncHandler(controller.createPackage));
router.patch('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate([...idRules, ...packagePatchRules]), asyncHandler(controller.updatePackage));
router.delete('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.deletePackage));

module.exports = router;
