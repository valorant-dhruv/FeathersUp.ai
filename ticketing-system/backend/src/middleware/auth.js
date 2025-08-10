const jwt = require('jsonwebtoken');
const { Customer, Agent } = require('../models');

//This middleware is used to protect the routes that are related to the customers
//Hence authentication is done here.
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, return error immediately
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    // Verifying the bearer token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from appropriate table based on role
    let user;
    if (decoded.role === 'customer') {
      user = await Customer.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    } else if (decoded.role === 'agent') {
      user = await Agent.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

//This middleware provides Role based access control to the routes
//Hence authorization is done here.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, no user' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'User role is not authorized to access this route' 
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
}; 