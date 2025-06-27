const { supabaseAdmin } = require('../utils/supabase');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Basic liveness probe - indicates the application is running
 */
const liveness = (req, res) => {
  return res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * Readiness probe - indicates the application is ready to serve requests
 */
const readiness = async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy'
      }
    });

  } catch (error) {
    logger.error('Readiness check failed:', error);
    return res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'unhealthy'
      },
      error: "Database connection failed"
    });
  }
};

/**
 * Detailed health check with comprehensive system information
 */
const detailed = async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Database health check
    const dbStart = Date.now();
    const { data, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    const dbDuration = Date.now() - dbStart;

    if (dbError) {
      healthData.checks.database = {
        status: 'unhealthy',
        error: "Database connection failed",
        responseTime: `${dbDuration}ms`
      };
      healthData.status = 'degraded';
    } else {
      healthData.checks.database = {
        status: 'healthy',
        responseTime: `${dbDuration}ms`
      };
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    healthData.checks.memory = {
      status: 'healthy',
      usage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      }
    };

    // System load check (if available)
    if (typeof process.cpuUsage === 'function') {
      const cpuUsage = process.cpuUsage();
      healthData.checks.cpu = {
        status: 'healthy',
        usage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      };
    }

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    return res.status(statusCode).json(healthData);

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

module.exports = {
  liveness,
  readiness,
  detailed
};
