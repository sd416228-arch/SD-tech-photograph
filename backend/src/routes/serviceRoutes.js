const express = require('express');
const controller = require('../controllers/serviceController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { serviceRules, servicePatchRules, idRules } = require('../validators/contentValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.listServices));
router.get('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.getService));
router.post('/', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(serviceRules), asyncHandler(controller.createService));
router.patch('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate([...idRules, ...servicePatchRules]), asyncHandler(controller.updateService));
router.delete('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.deleteService));

module.exports = router;
