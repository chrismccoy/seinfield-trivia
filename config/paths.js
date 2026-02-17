/**
 * Exports absolute filesystem paths used
 */

const path = require('path');

// Absolute path to the `/data` directory
const DATA_DIR = path.join(__dirname, '..', 'data');

// Absolute path to the sessions JSON persistence file */
const SESSION_FILE = path.join(DATA_DIR, 'sessions.json');

// Absolute path to the Seinfeld trivia
const TRIVIA_FILE = path.join(DATA_DIR, 'seinfeld.json');

module.exports = {
  DATA_DIR,
  SESSION_FILE,
  TRIVIA_FILE,
};
