/**
 * Utility functions for data formatting.
 */

const { DIFFICULTY_MAP, DEFAULT_DIFFICULTY } = require('../config/constants');

/**
 * Converts a numeric difficulty level to its human readable label.
 */
const mapDifficulty = (level) => {
  return DIFFICULTY_MAP[level] || DEFAULT_DIFFICULTY;
};

module.exports = { mapDifficulty };
