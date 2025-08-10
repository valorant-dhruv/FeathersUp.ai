const { Category } = require('../models');

/**
 * Seed function to populate the database with common support categories
 * These are categories that every company support team typically handles
 */
const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');
    
    const defaultCategories = [
      {
        name: 'Technical Support',
        description: 'Hardware, software, and system-related technical issues',
        color: '#dc3545',
        isActive: true
      },
      {
        name: 'Account & Billing',
        description: 'Account management, billing questions, and payment issues',
        color: '#28a745',
        isActive: true
      },
      {
        name: 'Feature Request',
        description: 'New feature suggestions and enhancement requests',
        color: '#17a2b8',
        isActive: true
      },
      {
        name: 'Bug Report',
        description: 'Software bugs, errors, and unexpected behavior',
        color: '#ffc107',
        isActive: true
      },
      {
        name: 'General Inquiry',
        description: 'General questions about products, services, or company',
        color: '#6c757d',
        isActive: true
      },
      {
        name: 'Access & Permissions',
        description: 'User access, login issues, and permission requests',
        color: '#6610f2',
        isActive: true
      },
      {
        name: 'Integration Support',
        description: 'Third-party integrations and API-related issues',
        color: '#fd7e14',
        isActive: true
      },
      {
        name: 'Training & Documentation',
        description: 'Training requests and documentation questions',
        color: '#20c997',
        isActive: true
      },
      {
        name: 'Performance Issues',
        description: 'Slow performance, timeouts, and optimization requests',
        color: '#e83e8c',
        isActive: true
      },
      {
        name: 'Data & Privacy',
        description: 'Data-related questions, privacy concerns, and GDPR requests',
        color: '#6f42c1',
        isActive: true
      }
    ];

    // Check if categories already exist to avoid duplicates
    const existingCategories = await Category.findAll();
    
    if (existingCategories.length === 0) {
      // Create all default categories
      const createdCategories = await Category.bulkCreate(defaultCategories);
      console.log(`✅ Created ${createdCategories.length} default categories`);
      
      // Log the created categories
      createdCategories.forEach(category => {
        console.log(`   - ${category.name} (${category.color})`);
      });
    } else {
      console.log(`ℹ️  Categories already exist (${existingCategories.length} found), skipping seed`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

/**
 * Function to add a single category (useful for adding custom categories later)
 */
const addCategory = async (categoryData) => {
  try {
    const category = await Category.create(categoryData);
    console.log(`✅ Added new category: ${category.name}`);
    return category;
  } catch (error) {
    console.error('❌ Error adding category:', error);
    throw error;
  }
};

/**
 * Function to reset categories (useful for development/testing)
 */
const resetCategories = async () => {
  try {
    console.log('🔄 Resetting categories...');
    
    // Deactivate all existing categories
    await Category.update(
      { isActive: false },
      { where: {} }
    );
    
    // Delete all categories
    await Category.destroy({ where: {} });
    
    console.log('✅ Categories reset successfully');
    
    // Re-seed with default categories
    await seedCategories();
    
    return true;
  } catch (error) {
    console.error('❌ Error resetting categories:', error);
    throw error;
  }
};

module.exports = {
  seedCategories,
  addCategory,
  resetCategories
}; 