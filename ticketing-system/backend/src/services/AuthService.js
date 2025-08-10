const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Generate JWT token for user
   * @param {number} userId - User ID
   * @param {string} role - User role (customer, agent)
   * @returns {string} JWT token
   */
  static generateToken(userId, role) {
    const payload = {
      id: userId,
      role: role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Extract token from authorization header
   * @param {string} authHeader - Authorization header
   * @returns {string|null} Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Check if user has required permissions
   * @param {object} user - User object
   * @param {string} permission - Required permission
   * @returns {boolean} Whether user has permission
   */
  static hasPermission(user, permission) {
    if (user.role === 'customer') {
      // Customers have limited permissions
      const customerPermissions = ['view_own_tickets', 'create_ticket', 'comment_own_ticket'];
      return customerPermissions.includes(permission);
    }

    if (user.role === 'agent') {
      // Super agents have all permissions
      if (user.isSuperAgent) {
        return true;
      }

      // Regular agents check their permissions object
      if (user.permissions && user.permissions[permission]) {
        return user.permissions[permission];
      }

      // Default agent permissions
      const defaultAgentPermissions = [
        'view_all_tickets',
        'update_tickets',
        'assign_tickets',
        'comment_tickets',
        'view_customers'
      ];
      return defaultAgentPermissions.includes(permission);
    }

    return false;
  }

  /**
   * Generate password reset token (for future implementation)
   * @param {number} userId - User ID
   * @returns {string} Reset token
   */
  static generatePasswordResetToken(userId) {
    const payload = {
      id: userId,
      type: 'password_reset',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h' // Reset tokens expire in 1 hour
    });
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {object} Decoded token payload
   */
  static verifyPasswordResetToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}

module.exports = AuthService;