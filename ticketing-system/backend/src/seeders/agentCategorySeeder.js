const { Agent, Category, AgentCategory } = require('../models');

const seedAgentCategories = async () => {
  console.log('🔄 Seeding agent category subscriptions...');
  
  try {
    // Get all agents and categories
    const agents = await Agent.findAll();
    const categories = await Category.findAll();
    
    if (agents.length === 0 || categories.length === 0) {
      console.log('⚠️  No agents or categories found, skipping agent category seeding');
      return;
    }

    // Subscribe agents to categories based on some logic
    // For example: subscribe all agents to all categories initially
    // In a real system, this would be more specific
    
    const subscriptions = [];
    
    for (const agent of agents) {
      // Subscribe each agent to 2-3 random categories
      const shuffledCategories = categories.sort(() => 0.5 - Math.random());
      const categoriesToSubscribe = shuffledCategories.slice(0, Math.min(3, categories.length));
      
      for (const category of categoriesToSubscribe) {
        subscriptions.push({
          agentId: agent.id,
          categoryId: category.id
        });
      }
    }

    // Remove duplicates
    const uniqueSubscriptions = subscriptions.filter((sub, index, self) =>
      index === self.findIndex(s => s.agentId === sub.agentId && s.categoryId === sub.categoryId)
    );

    // Bulk create subscriptions
    await AgentCategory.bulkCreate(uniqueSubscriptions, {
      ignoreDuplicates: true
    });

    console.log(`✅ Created ${uniqueSubscriptions.length} agent category subscriptions`);
    
    // Log subscription summary
    const subscriptionSummary = {};
    for (const agent of agents) {
      const agentSubs = uniqueSubscriptions.filter(sub => sub.agentId === agent.id);
      subscriptionSummary[agent.name] = agentSubs.length;
    }
    
    console.log('📊 Agent subscription summary:', subscriptionSummary);
    
  } catch (error) {
    console.error('❌ Error seeding agent categories:', error);
    throw error;
  }
};

module.exports = { seedAgentCategories };