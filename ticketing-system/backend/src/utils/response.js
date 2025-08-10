// Success response helper
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error response helper
const errorResponse = (res, error, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
};

// Pagination response helper
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  });
};

// Created response helper
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

// Updated response helper
const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, data, message, 200);
};

// Deleted response helper
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return res.status(200).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};

// Not found response helper
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, null, message, 404);
};

// Unauthorized response helper
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, null, message, 401);
};

// Forbidden response helper
const forbiddenResponse = (res, message = 'Forbidden access') => {
  return errorResponse(res, null, message, 403);
};

// Bad request response helper
const badRequestResponse = (res, error, message = 'Bad request') => {
  return errorResponse(res, error, message, 400);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse
}; 