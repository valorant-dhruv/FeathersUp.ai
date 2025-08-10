const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const authValidators = require('../validators/authValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /auth/register/customer
 * @desc    Register a new customer
 * @access  Public
 */
router.post(
  '/register/customer',
  authValidators.registerCustomer,
  handleValidationErrors,
  AuthController.registerCustomer
);

/**
 * @route   POST /auth/register/agent
 * @desc    Register a new agent (admin only)
 * @access  Private (Super Agent only)
 */
router.post(
  '/register/agent',
  authValidators.registerAgent,
  handleValidationErrors,
  protect,
  authorize('agent'),
  AuthController.registerAgent
);

/**
 * @route   POST /auth/login
 * @desc    Login user (customer or agent)
 * @access  Public
 */
router.post(
  '/login',
  authValidators.login,
  handleValidationErrors,
  AuthController.login
);

/**
 * @route   GET /auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  protect,
  AuthController.getProfile
);

/**
 * @route   PUT /auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authValidators.updateProfile,
  handleValidationErrors,
  protect,
  AuthController.updateProfile
);

/**
 * @route   PUT /auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authValidators.changePassword,
  handleValidationErrors,
  protect,
  AuthController.changePassword
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  protect,
  AuthController.logout
);

module.exports = router;