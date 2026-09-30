const express = require('express');
const { login, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { loginRules } = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.post('/login', validate(loginRules), asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.post('/logout', logout);

module.exports = router;
