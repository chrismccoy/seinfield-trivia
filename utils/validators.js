/**
 * Input validation helpers for request data
 */

const { SESSION_ID_PATTERN, MAX_STRING_LENGTH } = require('../config/constants');

/**
 * Validates that a session ID matches the expected format.
 */
const isValidSessionId = (sessionId) => {
  return typeof sessionId === 'string' && SESSION_ID_PATTERN.test(sessionId);
};

/**
 * Validates that a value is a non-empty string within the allowed length limit.
 */
const isValidString = (value, maxLength = MAX_STRING_LENGTH) => {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
};

/**
 * Validates that a value is a boolean.
 */
const isBoolean = (value) => {
  return typeof value === 'boolean';
};

module.exports = { isValidSessionId, isValidString, isBoolean };
