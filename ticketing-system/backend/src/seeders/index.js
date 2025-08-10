const { seedCategories } = require('./categorySeeder');
const { seedSuperAgent } = require('./superAgentSeeder');
const { seedAgentCategories } = require('./agentCategorySeeder');

/**
 * Main seeder function that runs all seed operations
 * This ensures the database is populated with necessary initial data
 */
const runAllSeeders = async () => {
  try {
    console.log('🚀 Starting database seeding process...');
    
    // Seed categories first (they're referenced by tickets)
    await seedCategories();
    
    // Seed super agent for admin access
    await seedSuperAgent();
    
    // Seed agent category subscriptions
    await seedAgentCategories();
    
    // Add more seeders here as needed
    // await seedSampleTickets();
    
    console.log('✅ All seeders completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    throw error;
  }
};

/**
 * Function to seed only categories (useful for specific operations)
 */
const seedOnlyCategories = async () => {
  try {
    await seedCategories();
    return true;
  } catch (error) {
    console.error('❌ Category seeding failed:', error);
    throw error;
  }
};

module.exports = {
  runAllSeeders,
  seedOnlyCategories
}; 