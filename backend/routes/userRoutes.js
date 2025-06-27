const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  deleteAccount,
  searchUsers,
  getUserStats,
  getUserById
} = require('../controllers/userController');

const {
  updateProfileValidation,
  searchUsersValidation,
  getUserByIdValidation
} = require('../validators/userValidators');

const { handleValidationErrors, sanitizeInput } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @route GET /api/v1/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
  authenticateToken,
  getProfile
);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  authenticateToken,
  sanitizeInput,
  updateProfileValidation,
  handleValidationErrors,
  updateProfile
);

/**
 * @route DELETE /api/v1/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account',
  authenticateToken,
  deleteAccount
);

/**
 * @route GET /api/v1/users/search
 * @desc Search users (Admin only)
 * @access Private (Admin)
 */
router.get('/search',
  authenticateToken,
  requireAdmin,
  searchUsersValidation,
  handleValidationErrors,
  searchUsers
);

/**
 * @route GET /api/v1/users/stats
 * @desc Get user statistics (Admin only)
 * @access Private (Admin)
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  getUserStats
);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID (Admin only)
 * @access Private (Admin)
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  getUserByIdValidation,
  handleValidationErrors,
  getUserById
);

module.exports = router;
