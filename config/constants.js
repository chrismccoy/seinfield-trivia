/**
 * Application constants.
 */

// Prefix prepended to every generated session ID
const SESSION_PREFIX = 'sess_';

// Key used to persist the session ID in the browser's localStorage
const LOCAL_STORAGE_KEY = 'seinfeldTriviaId';

// Number of random characters appended after the session prefix
const SESSION_ID_LENGTH = 9;

// Validation pattern for session IDs
const SESSION_ID_PATTERN = /^sess_[a-z0-9]{9}$/;

// Maximum entries kept in sessions.json before pruning oldest
const MAX_SESSION_FILE_ENTRIES = 10000;

// Maximum character length
const MAX_STRING_LENGTH = 500;

/**
 * Maps numeric difficulty levels to human-readable labels.
 */
const DIFFICULTY_MAP = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};

// Fallback difficulty when a question has an unmapped level
const DEFAULT_DIFFICULTY = 'medium';

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests. Please try again later.',
};

// Default HTTP port when PORT env variable is not set
const DEFAULT_PORT = 3000;

module.exports = {
  SESSION_PREFIX,
  LOCAL_STORAGE_KEY,
  SESSION_ID_LENGTH,
  SESSION_ID_PATTERN,
  MAX_SESSION_FILE_ENTRIES,
  MAX_STRING_LENGTH,
  DIFFICULTY_MAP,
  DEFAULT_DIFFICULTY,
  RATE_LIMIT,
  DEFAULT_PORT,
};
