const express = require('express');
const controller = require('../controllers/galleryController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { galleryRules, galleryPatchRules, idRules } = require('../validators/contentValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.listGallery));
router.get('/admin', requireAuth, requireRoles('OWNER', 'ADMIN'), asyncHandler(controller.listGallery));
router.get('/:id', validate(idRules), asyncHandler(controller.getGalleryItem));
router.post('/', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(galleryRules), asyncHandler(controller.createGalleryItem));
router.patch('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate([...idRules, ...galleryPatchRules]), asyncHandler(controller.updateGalleryItem));
router.delete('/:id', requireAuth, requireRoles('OWNER', 'ADMIN'), validate(idRules), asyncHandler(controller.deleteGalleryItem));

module.exports = router;
