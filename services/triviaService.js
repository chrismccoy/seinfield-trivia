/**
 * Loads the Seinfeld question data and caches it in memory,
 * and serves random questions and optional difficulty / season filtering.
 */

const fs = require('fs').promises;
const { TRIVIA_FILE } = require('../config/paths');
const { mapDifficulty } = require('../utils/formatters');

/**
 * In-memory cache of the parsed `seinfeld.json` data.
 */
let cachedData = null;

/**
 * Indexed episode lookup table built once after data is loaded.
 */
let episodeIndex = null;

/**
 * Tracks question IDs already served to each session to avoid repeats.
 */
const sessionQuestionHistory = new Map();

// Maximum idle time for a session's duplicate history
const SESSION_TTL_MS = 60 * 60 * 1000;

// Hard cap on tracked sessions to bound memory usage
const MAX_TRACKED_SESSIONS = 5000;

/**
 * Removes session entries that haven't been accessed
 */
function pruneStaleHistory() {
  const now = Date.now();
  for (const [id, entry] of sessionQuestionHistory) {
    if (now - entry.lastAccess > SESSION_TTL_MS) {
      sessionQuestionHistory.delete(id);
    }
  }
}

/**
 * Reads and parses the trivia data file, then caches the result.
 */
async function loadData() {
  if (cachedData) return cachedData;

  try {
    const raw = await fs.readFile(TRIVIA_FILE, 'utf8');
    cachedData = JSON.parse(raw);
    buildEpisodeIndex();
    return cachedData;
  } catch (error) {
    console.error('[triviaService] Error loading trivia data:', error.message);
    throw new Error('Could not load trivia data.');
  }
}

/**
 * Builds a Map-based index for episode lookups
 */
function buildEpisodeIndex() {
  episodeIndex = new Map();
  if (cachedData && cachedData.episodes) {
    for (const ep of cachedData.episodes) {
      episodeIndex.set(`${ep.season}:${ep.episode}`, ep);
    }
  }
}

/**
 * Looks up an episode title using the pre-built index.
 */
function findEpisode(season, episode) {
  if (!episodeIndex) return undefined;
  return episodeIndex.get(`${season}:${episode}`);
}

/**
 * Extracts the incorrect answers from a question's `options` array
 * by filtering out the correct answer.
 */
function getIncorrectAnswers(question) {
  return question.options.filter((opt) => opt !== question.answer);
}

/**
 * Returns a single formatted random trivia question
 */
async function fetchQuestion({ sessionId, difficulty, season } = {}) {
  const data = await loadData();
  let pool = data.questions;

  if (difficulty) {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  if (season) {
    pool = pool.filter((q) => q.s === season);
  }

  if (pool.length === 0) {
    const err = new Error('No questions available for the selected filters.');
    err.statusCode = 400;
    throw err;
  }

  if (sessionId) {
    pruneStaleHistory();

    if (!sessionQuestionHistory.has(sessionId)) {
      if (sessionQuestionHistory.size >= MAX_TRACKED_SESSIONS) {
        let lruKey = null;
        let lruTime = Infinity;
        for (const [key, val] of sessionQuestionHistory) {
          if (val.lastAccess < lruTime) {
            lruTime = val.lastAccess;
            lruKey = key;
          }
        }
        if (lruKey) sessionQuestionHistory.delete(lruKey);
      }
      sessionQuestionHistory.set(sessionId, { seen: new Set(), lastAccess: Date.now() });
    }

    const entry = sessionQuestionHistory.get(sessionId);
    entry.lastAccess = Date.now();

    const unseen = pool.filter((q) => !entry.seen.has(q.id));

    if (unseen.length === 0) {
      entry.seen.clear();
    } else {
      pool = unseen;
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const q = pool[randomIndex];

  // Record the question so it won't be repeated this session.
  if (sessionId && sessionQuestionHistory.has(sessionId)) {
    sessionQuestionHistory.get(sessionId).seen.add(q.id);
  }

  const episodeInfo = findEpisode(q.s, q.e);

  return {
    category: episodeInfo
      ? `Season ${q.s}, Ep ${q.e}: "${episodeInfo.title}"`
      : `Season ${q.s}`,
    difficulty: mapDifficulty(q.difficulty),
    question: q.text,
    correct_answer: q.answer,
    incorrect_answers: getIncorrectAnswers(q),
  };
}

/**
 * Removes the question history for a given session
 */
function clearSessionHistory(sessionId) {
  sessionQuestionHistory.delete(sessionId);
}

module.exports = { fetchQuestion, clearSessionHistory };
