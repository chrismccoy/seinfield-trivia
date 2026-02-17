/**
 * Manages session persistence, and initialising the storage file,
 * saving individual answers, retrieving session statistics, and pruning
 * stale entries.
 */

const fs = require('fs').promises;
const { SESSION_FILE, DATA_DIR } = require('../config/paths');
const { MAX_SESSION_FILE_ENTRIES } = require('../config/constants');

/**
 * Serialised write queue.
 */
let writeQueue = Promise.resolve();

/**
 * Enqueues a file write operation so that concurrent calls execute sequentially,
 * preventing data loss from overlapping
 */
function enqueueWrite(fn) {
  const task = writeQueue.then(fn);

  // Keep the queue alive even if this task fails, so later writes still run.
  writeQueue = task.catch((err) => {
    console.error('[sessionService] Queued write failed:', err.message);
  });

  return task;
}

/**
 * Ensures the data directory and `sessions.json` file exist.
 */
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(SESSION_FILE);
    } catch {
      await fs.writeFile(SESSION_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.error('[sessionService] Storage initialisation failed:', err.message);
    throw err;
  }
}

/**
 * Reads the current session history from disk.
 */
async function readHistory() {
  const raw = await fs.readFile(SESSION_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

/**
 * Writes the full history array back to disk (pretty-printed).
 */
async function writeHistory(history) {
  await fs.writeFile(SESSION_FILE, JSON.stringify(history, null, 2));
}

/**
 * Appends a user's answer to the session history file.
 */
async function saveSession(entry, sessionId) {
  return enqueueWrite(async () => {
    const history = await readHistory();

    history.push({
      ...entry,
      sessionId,
      timestamp: new Date().toISOString(),
    });

    // Prune oldest entries when the file grows beyond the configured limit.
    if (history.length > MAX_SESSION_FILE_ENTRIES) {
      history.splice(0, history.length - MAX_SESSION_FILE_ENTRIES);
    }

    await writeHistory(history);
  });
}

/**
 * Gets the aggregate statistics for a given session.
 */
async function getSessionStats(sessionId) {
  try {
    const history = await readHistory();
    const sessionAnswers = history.filter((h) => h.sessionId === sessionId);

    return {
      total: sessionAnswers.length,
      correct: sessionAnswers.filter((a) => a.isCorrect).length,
    };
  } catch (err) {
    console.error('[sessionService] Error fetching stats:', err.message);
    return { total: 0, correct: 0 };
  }
}

module.exports = { initStorage, saveSession, getSessionStats };
