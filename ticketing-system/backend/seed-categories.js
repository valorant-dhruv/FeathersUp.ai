#!/usr/bin/env node

/**
 * CLI script for managing categories
 * Usage: node seed-categories.js [command]
 * Commands:
 *   seed     - Seed default categories
 *   reset    - Reset and re-seed categories
 *   add      - Add a single category (interactive)
 */

require('dotenv').config();
const readline = require('readline');
const { sequelize } = require('./src/models');
const { seedCategories, addCategory, resetCategories } = require('./src/seeders/categorySeeder');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  const command = process.argv[2] || 'seed';
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    switch (command) {
      case 'seed':
        console.log('🌱 Seeding default categories...');
        await seedCategories();
        break;
        
      case 'reset':
        console.log('🔄 Resetting and re-seeding categories...');
        await resetCategories();
        break;
        
      case 'add':
        console.log('➕ Adding a new category...');
        await addCategoryInteractive();
        break;
        
      default:
        console.log('❌ Unknown command. Available commands: seed, reset, add');
        process.exit(1);
    }
    
    console.log('✅ Operation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

async function addCategoryInteractive() {
  try {
    const name = await question('Category name: ');
    const description = await question('Description (optional): ');
    const color = await question('Color (hex, default #007bff): ') || '#007bff';
    
    if (!name.trim()) {
      throw new Error('Category name is required');
    }
    
    const categoryData = {
      name: name.trim(),
      description: description.trim() || null,
      color: color.trim(),
      isActive: true
    };
    
    await addCategory(categoryData);
    console.log(`✅ Category "${name}" added successfully!`);
    
  } catch (error) {
    console.error('❌ Failed to add category:', error.message);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  sequelize.close();
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
} 