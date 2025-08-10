const { validationResult } = require('express-validator');
const { badRequestResponse } = require('../utils/response');

/**
 * Middleware to handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return badRequestResponse(res, {
      errors: formattedErrors
    }, 'Validation failed');
  }

  next();
};

module.exports = {
  handleValidationErrors
};