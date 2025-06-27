const bcrypt = require('bcryptjs');
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/responses');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          role: 'user'
        }
      }
    });

    if (authError) {
      logger.error('Registration error:', authError);
      return errorResponse(res, authError.message, 400);
    }

    if (!authData.user) {
      return errorResponse(res, 'Registration failed', 400);
    }

    // Create user profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      logger.error('Profile creation error:', profileError);
      // Continue anyway as the user is created in auth
    }

    logger.info(`User registered successfully: ${email}`);

    return successResponse(res, {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        emailConfirmed: authData.user.email_confirmed_at !== null
      },
      session: authData.session
    }, 'Registration successful. Please check your email for verification.', 201);

  } catch (error) {
    logger.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.warn(`Login attempt failed for email: ${email}`, authError.message);
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    if (!authData.user || !authData.session) {
      return unauthorizedResponse(res, 'Login failed');
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    logger.info(`User logged in successfully: ${email}`);

    return successResponse(res, {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        role: authData.user.user_metadata?.role || 'user'
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout error:', error);
      return errorResponse(res, 'Logout failed', 400);
    }

    logger.info(`User logged out: ${req.user?.email}`);
    return successResponse(res, null, 'Logout successful');

  } catch (error) {
    logger.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Refresh JWT token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const { data: authData, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !authData.session) {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    return successResponse(res, {
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at
      }
    }, 'Token refreshed successfully');

  } catch (error) {
    logger.error('Token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      logger.error('Password reset request error:', error);
      return errorResponse(res, 'Password reset request failed', 400);
    }

    logger.info(`Password reset requested for: ${email}`);
    return successResponse(res, null, 'Password reset email sent');

  } catch (error) {
    logger.error('Password reset request error:', error);
    return errorResponse(res, 'Password reset request failed', 500);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify the reset token and update password
    const { data: authData, error } = await supabase.auth.updateUser({
      email,
      password
    });


    if (error) {
      logger.error('Password reset error:', error);
      return errorResponse(res, 'Password reset failed', 400);
    }

    logger.info(`Password reset successful for user: ${authData.user?.email}`);
    return successResponse(res, null, 'Password reset successful');

  } catch (error) {
    logger.error('Password reset error:', error);
    return errorResponse(res, 'Password reset failed', 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
