const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const { Category } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   GET /categories
 * @desc    Get all active categories
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    successResponse(res, { categories }, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    errorResponse(res, error, 'Failed to retrieve categories', 500);
  }
});

/**
 * @route   GET /categories/all
 * @desc    Get all categories (including inactive ones) - Admin only
 * @access  Private (Super Agents only)
 */
router.get('/all', protect, authorize('agent'), async (req, res) => {
  try {
    // Only super agents can see all categories including inactive ones
    if (!req.user.isSuperAgent) {
      return errorResponse(res, null, 'Only super agents can view all categories', 403);
    }

    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    successResponse(res, { categories }, 'All categories retrieved successfully');
  } catch (error) {
    console.error('Get all categories error:', error);
    errorResponse(res, error, 'Failed to retrieve all categories', 500);
  }
});

/**
 * @route   POST /categories
 * @desc    Create a new category
 * @access  Private (Agents only)
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .notEmpty()
      .withMessage('Name is required'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { name, description, color } = req.body;

      // Check if category with same name exists
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return errorResponse(res, null, 'Category with this name already exists', 400);
      }

      const category = await Category.create({
        name,
        description,
        color: color || '#007bff'
      });

      successResponse(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      console.error('Create category error:', error);
      errorResponse(res, error, 'Failed to create category', 500);
    }
  }
);

/**
 * @route   POST /categories/bulk
 * @desc    Create multiple categories at once
 * @access  Private (Super Agents only)
 */
router.post(
  '/bulk',
  [
    body('categories')
      .isArray({ min: 1 })
      .withMessage('Categories must be an array with at least one item'),
    
    body('categories.*.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Each category name must be between 2 and 100 characters')
      .notEmpty()
      .withMessage('Category name is required'),
    
    body('categories.*.description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('categories.*.color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { categories } = req.body;

      // Only super agents can bulk create categories
      if (!req.user.isSuperAgent) {
        return errorResponse(res, null, 'Only super agents can bulk create categories', 403);
      }

      // Check for duplicate names in the request
      const names = categories.map(cat => cat.name);
      const uniqueNames = new Set(names);
      if (names.length !== uniqueNames.size) {
        return errorResponse(res, null, 'Duplicate category names found in request', 400);
      }

      // Check if any categories with these names already exist
      const existingCategories = await Category.findAll({
        where: { name: names }
      });

      if (existingCategories.length > 0) {
        const existingNames = existingCategories.map(cat => cat.name);
        return errorResponse(res, null, `Categories already exist: ${existingNames.join(', ')}`, 400);
      }

      // Create all categories
      const createdCategories = await Category.bulkCreate(
        categories.map(cat => ({
          ...cat,
          color: cat.color || '#007bff',
          isActive: true
        }))
      );

      successResponse(res, { 
        categories: createdCategories 
      }, `Successfully created ${createdCategories.length} categories`, 201);
    } catch (error) {
      console.error('Bulk create categories error:', error);
      errorResponse(res, error, 'Failed to create categories', 500);
    }
  }
);

/**
 * @route   PUT /categories/:id
 * @desc    Update category
 * @access  Private (Agents only)
 */
router.put(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return errorResponse(res, null, 'Category not found', 404);
      }

      // Check if new name conflicts with existing category
      if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await Category.findOne({ 
          where: { name: updateData.name } 
        });
        if (existingCategory) {
          return errorResponse(res, 'Category with this name already exists', 400);
        }
      }

      await category.update(updateData);

      successResponse(res, { category }, 'Category updated successfully');
    } catch (error) {
      console.error('Update category error:', error);
      errorResponse(res, error, 'Failed to update category', 500);
    }
  }
);

/**
 * @route   DELETE /categories/:id
 * @desc    Delete (deactivate) category
 * @access  Private (Super Agents only)
 */
router.delete(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer')
  ],
  handleValidationErrors,
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Only super agents can delete categories
      if (!req.user.isSuperAgent) {
        return errorResponse(res, null, 'Only super agents can delete categories', 403);
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return errorResponse(res, null, 'Category not found', 404);
      }

      // Soft delete by setting isActive to false
      await category.update({ isActive: false });

      successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      console.error('Delete category error:', error);
      errorResponse(res, error, 'Failed to delete category', 500);
    }
  }
);

module.exports = router;