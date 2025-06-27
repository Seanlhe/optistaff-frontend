const { supabase, supabaseAdmin } = require('../utils/supabase');
const { successResponse, errorResponse, notFoundResponse, forbiddenResponse } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('job_seekers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Get profile error:', error);
      return errorResponse(res, 'Failed to fetch profile', 500);
    }

    if (!profile) {
      return notFoundResponse(res, 'Profile not found');
    }

    return successResponse(res, {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      dateOfBirth: profile.date_of_birth,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }, 'Profile retrieved successfully');

  } catch (error) {
    logger.error('Get profile error:', error);
    return errorResponse(res, 'Failed to fetch profile', 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, dateOfBirth, bio } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (bio !== undefined) updateData.bio = bio;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Update profile error:', error);
      return errorResponse(res, 'Failed to update profile', 500);
    }

    logger.info(`Profile updated for user: ${req.user.email}`);

    return successResponse(res, {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      dateOfBirth: profile.date_of_birth,
      bio: profile.bio,
      updatedAt: profile.updated_at
    }, 'Profile updated successfully');

  } catch (error) {
    logger.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user from auth (this will cascade to profiles due to RLS)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      logger.error('Delete account error:', authError);
      return errorResponse(res, 'Failed to delete account', 500);
    }

    logger.info(`Account deleted for user: ${req.user.email}`);
    return successResponse(res, null, 'Account deleted successfully');

  } catch (error) {
    logger.error('Delete account error:', error);
    return errorResponse(res, 'Failed to delete account', 500);
  }
};

/**
 * Search users (Admin only)
 */
const searchUsers = async (req, res) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, updated_at', { count: 'exact' });

    // Add search filter if query provided
    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    // Add sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      logger.error('Search users error:', error);
      return errorResponse(res, 'Failed to search users', 500);
    }

    const totalPages = Math.ceil(count / limit);

    return successResponse(res, {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Users retrieved successfully');

  } catch (error) {
    logger.error('Search users error:', error);
    return errorResponse(res, 'Failed to search users', 500);
  }
};

/**
 * Get user statistics (Admin only)
 */
const getUserStats = async (req, res) => {
  try {
    // Get total user count
    const { count: totalUsers, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentUsers, error: recentError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      throw recentError;
    }

    // Get users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayUsers, error: todayError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (todayError) {
      throw todayError;
    }

    return successResponse(res, {
      totalUsers,
      recentUsers,
      todayUsers,
      generatedAt: new Date().toISOString()
    }, 'User statistics retrieved successfully');

  } catch (error) {
    logger.error('Get user stats error:', error);
    return errorResponse(res, 'Failed to retrieve user statistics', 500);
  }
};

/**
 * Get user by ID (Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Get user by ID error:', error);
      return errorResponse(res, 'Failed to fetch user', 500);
    }

    if (!profile) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      dateOfBirth: profile.date_of_birth,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }, 'User retrieved successfully');

  } catch (error) {
    logger.error('Get user by ID error:', error);
    return errorResponse(res, 'Failed to fetch user', 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  searchUsers,
  getUserStats,
  getUserById
};
