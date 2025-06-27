const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responses');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return unauthorizedResponse(res, 'Access token is required');
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token attempt:', { error: error?.message });
      return unauthorizedResponse(res, 'Invalid or expired token');
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return unauthorizedResponse(res, 'Token verification failed');
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    // Check if user has admin role in user metadata
    const isAdmin = req.user.user_metadata?.role === 'admin' || 
                   req.user.app_metadata?.role === 'admin';

    if (!isAdmin) {
      return forbiddenResponse(res, 'Admin access required');
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return forbiddenResponse(res, 'Access denied');
  }
};

/**
 * Optional authentication - don't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
