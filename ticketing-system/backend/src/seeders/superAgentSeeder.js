const bcrypt = require('bcryptjs');
const { Agent } = require('../models');

/**
 * Seeds a default super agent for testing and initial setup
 * This allows the first admin access to register other agents
 */
const seedSuperAgent = async () => {
  try {
    console.log('🔍 Checking for existing super agents...');
    
    // Check if any super agents already exist
    const existingSuperAgent = await Agent.findOne({
      where: { isSuperAgent: true }
    });
    
    if (existingSuperAgent) {
      console.log('✅ Super agent already exists, skipping seeding');
      return;
    }
    
    console.log('🌱 Creating default super agent...');
    
    // Hash password for security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('SuperAgent123!', saltRounds);
    
    // Create super agent
    const superAgent = await Agent.create({
      name: 'Super Agent',
      email: 'admin@feathersup.com',
      password: hashedPassword,
      permissions: {
        canManageCustomers: true,
        canManageTickets: true,
        canManageAgents: true,
        canViewReports: true,
        canManageSystem: true
      },
      isSuperAgent: true,
      role: 'agent',
      status: 'active'
    });
    
    console.log('✅ Super agent created successfully!');
    console.log('📖 Check SUPER_AGENT_SETUP.md for login credentials');
    console.log('🔒 Change the default password immediately after first login!');
    
    return superAgent;
  } catch (error) {
    console.error('❌ Failed to seed super agent:', error);
    throw error;
  }
};

module.exports = {
  seedSuperAgent
};