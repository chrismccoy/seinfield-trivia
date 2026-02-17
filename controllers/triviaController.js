/**
 * Request handlers for trivia game routes.
 */

const triviaService = require('../services/triviaService');
const sessionService = require('../services/sessionService');
const { isValidSessionId, isValidString, isBoolean } = require('../utils/validators');
const { SESSION_PREFIX, LOCAL_STORAGE_KEY, SESSION_ID_LENGTH } = require('../config/constants');

/**
 * Renders the main page with a server-side-rendered initial question.
 */
exports.renderGame = async (req, res, next) => {
  try {
    const question = await triviaService.fetchQuestion();
    res.render('index', {
      initialQuestion: question,
      sessionConfig: { SESSION_PREFIX, LOCAL_STORAGE_KEY, SESSION_ID_LENGTH },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a random trivia question as JSON.
 */
exports.getQuestionAPI = async (req, res, next) => {
  try {
    const { sessionId, difficulty, season } = req.query;

    const options = {};
    if (sessionId && isValidSessionId(sessionId)) {
      options.sessionId = sessionId;
    }
    if (difficulty) {
      const d = Number(difficulty);
      if ([1, 2, 3].includes(d)) options.difficulty = d;
    }
    if (season) {
      const s = Number(season);
      if (Number.isInteger(s) && s > 0) options.season = s;
    }

    const question = await triviaService.fetchQuestion(options);
    res.json(question);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns aggregate statistics (total answered, total correct) for a session.
 */
exports.getStats = async (req, res, next) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || !isValidSessionId(sessionId)) {
      return res.json({ total: 0, correct: 0 });
    }

    const stats = await sessionService.getSessionStats(sessionId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Persists a user's answer for the current session.
 */
exports.saveResult = async (req, res, next) => {
  try {
    const { question, userAnswer, isCorrect, sessionId } = req.body;

    if (!isValidString(question)) {
      const error = new Error('Invalid or missing "question" field.');
      error.statusCode = 400;
      throw error;
    }
    if (!isValidString(userAnswer)) {
      const error = new Error('Invalid or missing "userAnswer" field.');
      error.statusCode = 400;
      throw error;
    }
    if (!isBoolean(isCorrect)) {
      const error = new Error('"isCorrect" must be a boolean.');
      error.statusCode = 400;
      throw error;
    }
    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid or missing "sessionId".');
      error.statusCode = 400;
      throw error;
    }

    await sessionService.saveSession({ question, userAnswer, isCorrect }, sessionId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Clears the in memory question deduplication history for a session.
 * Called by the frontend when the user starts a fresh game so they can
 * see all questions again from the beginning.
 */
exports.resetSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid or missing "sessionId".');
      error.statusCode = 400;
      throw error;
    }

    triviaService.clearSessionHistory(sessionId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
