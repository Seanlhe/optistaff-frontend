const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
} = require('../validators/authValidators');

const { handleValidationErrors, sanitizeInput } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
  sanitizeInput,
  registerValidation,
  handleValidationErrors,
  register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login',
  sanitizeInput,
  loginValidation,
  handleValidationErrors,
  login
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout',
  authenticateToken,
  logout
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh JWT token
 * @access Public
 */
router.post('/refresh',
  sanitizeInput,
  refreshTokenValidation,
  handleValidationErrors,
  refreshToken
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password',
  sanitizeInput,
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post('/reset-password',
  sanitizeInput,
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword
);

module.exports = router;
