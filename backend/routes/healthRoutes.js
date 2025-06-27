const express = require('express');
const router = express.Router();

const {
  liveness,
  readiness,
  detailed
} = require('../controllers/healthController');

/**
 * @route GET /health/liveness
 * @desc Liveness probe for Kubernetes
 * @access Public
 */
router.get('/liveness', liveness);

/**
 * @route GET /health/readiness
 * @desc Readiness probe for Kubernetes
 * @access Public
 */
router.get('/readiness', readiness);

/**
 * @route GET /health/detailed
 * @desc Detailed health check with system information
 * @access Public
 */
router.get('/detailed', detailed);

module.exports = router;
