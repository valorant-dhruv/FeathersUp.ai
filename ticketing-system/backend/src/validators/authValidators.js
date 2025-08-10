const { body } = require('express-validator');

const authValidators = {
  /**
   * Validation rules for customer registration
   */
  registerCustomer: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),

    body('company')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company name cannot exceed 100 characters')
  ],

  /**
   * Validation rules for agent registration
   */
  registerAgent: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

    body('permissions')
      .optional()
      .isObject()
      .withMessage('Permissions must be an object'),

    body('isSuperAgent')
      .optional()
      .isBoolean()
      .withMessage('isSuperAgent must be a boolean value')
  ],

  /**
   * Validation rules for login
   */
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),

    body('userType')
      .isIn(['customer', 'agent'])
      .withMessage('User type must be either "customer" or "agent"')
  ],

  /**
   * Validation rules for updating profile
   */
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),

    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),

    body('company')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company name cannot exceed 100 characters')
  ],

  /**
   * Validation rules for changing password
   */
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),

    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      })
  ]
};

module.exports = authValidators;