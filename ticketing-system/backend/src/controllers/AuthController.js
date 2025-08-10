const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Customer, Agent } = require('../models');
const AuthService = require('../services/AuthService');
const { successResponse, errorResponse, createdResponse, badRequestResponse } = require('../utils/response');

class AuthController {

  //This function is used to register a new customer
  static async registerCustomer(req, res) {
    try {
      const { name, email, password, phone, company } = req.body;

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ where: { email } });
      if (existingCustomer) {
        return badRequestResponse(res, 'Customer with this email already exists', 'Customer with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create customer
      const customer = await Customer.create({
        name,
        email,
        password: hashedPassword,
        phone,
        company,
        role: 'customer'
      });

      // Generate JWT token
      const token = AuthService.generateToken(customer.id, 'customer');

      // Remove password from response
      const customerData = customer.toJSON();
      delete customerData.password;

      createdResponse(res, {
        user: customerData,
        token,
        tokenExpires: '24h'
      }, 'Customer registered successfully');

    } catch (error) {
      console.error('Customer registration error:', error);
      errorResponse(res, 'Failed to register customer', 'Failed to register customer', 500);
    }
  }

  //This function is used to register a new agent
  static async registerAgent(req, res) {
    try {
      const { name, email, password, permissions, isSuperAgent } = req.body;

      // Check if agent already exists
      const existingAgent = await Agent.findOne({ where: { email } });
      if (existingAgent) {
        return badRequestResponse(res, 'Agent with this email already exists', 'Agent with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create agent
      const agent = await Agent.create({
        name,
        email,
        password: hashedPassword,
        permissions: permissions || {},
        isSuperAgent: isSuperAgent || false,
        role: 'agent'
      });

      // Generate JWT token
      const token = AuthService.generateToken(agent.id, 'agent');

      // Remove password from response
      const agentData = agent.toJSON();
      delete agentData.password;

      createdResponse(res, {
        user: agentData,
        token,
        tokenExpires: '24h'
      }, 'Agent registered successfully');

    } catch (error) {
      console.error('Agent registration error:', error);
      errorResponse(res, 'Failed to register agent', 'Failed to register agent', 500);
    }
  }

  //This function is used to login a user
  static async login(req, res) {
    try {
      const { email, password, userType } = req.body;

      if (!userType || !['customer', 'agent'].includes(userType)) {
        return badRequestResponse(res, 'Valid user type is required (customer or agent)', 'Valid user type is required (customer or agent)');
      }

      let user;
      if (userType === 'customer') {
        user = await Customer.findOne({ where: { email } });
      } else {
        user = await Agent.findOne({ where: { email } });
      }

      if (!user) {
        return errorResponse(res, 'Invalid credentials', 'Invalid credentials', 401);
      }

      // Check if user is active
      if (user.status !== 'active') {
        return errorResponse(res, 'Account is not active', 'Account is not active', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid credentials', 'Invalid credentials', 401);
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate JWT token
      const token = AuthService.generateToken(user.id, userType);

      // Remove password from response
      const userData = user.toJSON();
      delete userData.password;

      successResponse(res, {
        user: userData,
        token,
        tokenExpires: '24h'
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      errorResponse(res, 'Login failed', 'Login failed', 500);
    }
  }

  //This function is used to get the profile of a user
  static async getProfile(req, res) {
    try {
      const userData = req.user.toJSON();
      delete userData.password;

      successResponse(res, { user: userData }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      errorResponse(res, 'Failed to retrieve profile', 'Failed to retrieve profile', 500);
    }
  }

  //This function is used to update the profile of a user
  static async updateProfile(req, res) {
    try {
      const { name, phone, company } = req.body;
      const user = req.user;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (company && user.role === 'customer') updateData.company = company;

      await user.update(updateData);

      const userData = user.toJSON();
      delete userData.password;

      successResponse(res, { user: userData }, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      errorResponse(res, 'Failed to update profile', 'Failed to update profile', 500);
    }
  }

  //This function is used to change the password of a user
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return badRequestResponse(res, 'Current password is incorrect', 'Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedNewPassword });

      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      errorResponse(res, 'Failed to change password', 'Failed to change password', 500);
    }
  }

  //This function is used to logout a user
  static async logout(req, res) {
    try {
      // In a stateless JWT setup, logout is handled client-side by removing the token
      // You could implement a token blacklist here if needed
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      errorResponse(res, 'Logout failed', 'Logout failed', 500);
    }
  }
}

module.exports = AuthController;