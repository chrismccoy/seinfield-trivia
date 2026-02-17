/**
 * Defines the routes for all trivia related endpoints.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const triviaController = require('../controllers/triviaController');
const { RATE_LIMIT } = require('../config/constants');

const router = express.Router();

/**
 * Rate limiter applied to all `/api/*` endpoints.
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  /**
   * Custom handler invoked when a client exceeds the rate limit.
   */
  handler: (req, res) => {
    console.warn(`[RateLimit] ${req.ip} exceeded ${RATE_LIMIT.max} requests on ${req.method} ${req.path}`);
    res.status(429).json({ error: true, message: RATE_LIMIT.message });
  },
});

/**
 * Renders the main trivia game page with a server-side-rendered initial question.
 */
router.get('/', triviaController.renderGame);

/**
 * Returns a random trivia question. Supports `sessionId`, `difficulty`, and `season` query params.
 */
router.get('/api/trivia', apiLimiter, triviaController.getQuestionAPI);

/**
 * Returns session statistics (total answered, total correct).
 */
router.get('/api/stats', apiLimiter, triviaController.getStats);

/**
 * Saves a user's answer to the session history.
 */
router.post('/api/save-result', apiLimiter, triviaController.saveResult);

/**
 * Clears the server side question deduplication history for a session.
 */
router.post('/api/reset-session', apiLimiter, triviaController.resetSession);

module.exports = router;
