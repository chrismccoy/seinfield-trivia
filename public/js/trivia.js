/**
 * Alpine.js component powering the Seinfeld Trivia game UI.
 */

const FETCH_TIMEOUT_MS = 10000;

let LOCAL_STORAGE_KEY;
let SESSION_PREFIX;
let SESSION_ID_LENGTH;
let _configLoaded = false;

/**
 * Reads session constants from `<body>` data attributes.
 */
function _loadConfig() {
  if (_configLoaded) return;
  const b = document.body.dataset;
  LOCAL_STORAGE_KEY = b.storageKey || 'seinfeldTriviaId';
  SESSION_PREFIX = b.sessionPrefix || 'sess_';
  SESSION_ID_LENGTH = parseInt(b.sessionIdLength, 10) || 9;
  _configLoaded = true;
}

/**
 * Shuffle
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a random session ID in the format `sess_<alphanumeric>`.
 */
function generateSessionId() {
  return SESSION_PREFIX + Math.random().toString(36).substring(2, 2 + SESSION_ID_LENGTH);
}

/**
 * Wraps `fetch` with a timeout so the UI never hangs indefinitely.
 */
async function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Creates and returns the Alpine.js reactive data object for the trivia game.
 */
function triviaGame(initialData) {
  return {
    loading: false,
    gameEnded: false,
    showWelcomeModal: false,
    currentQuestion: initialData || null,
    allAnswers: [],
    hasAnswered: false,
    selectedAnswer: null,
    isCorrect: false,
    sessionId: '',
    stats: { total: 0, correct: 0 },
    savedStats: { total: 0, correct: 0 },
    fetchError: null,

    /**
     * Alpine `init` hook — runs automatically when the component mounts.
     * Checks localStorage for an existing session and either offers to
     * resume it or starts a fresh game.
     */
    async init() {
      _loadConfig();
      this.shuffleAnswers();

      const existingId = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (existingId) {
        try {
          const res = await fetchWithTimeout(`/api/stats?sessionId=${encodeURIComponent(existingId)}`);
          if (!res.ok) throw new Error(`Stats request failed (${res.status})`);

          const data = await res.json();

          if (data && typeof data.total === 'number' && data.total > 0) {
            this.sessionId = existingId;
            this.savedStats = data;
            this.showWelcomeModal = true;
          } else {
            this.startFresh();
          }
        } catch {
          this.startFresh();
        }
      } else {
        this.startFresh();
      }
    },

    /**
     * Resumes the previously active session, restoring its score and
     * dismissing the welcome modal.
     */
    continueSession() {
      this.stats = { ...this.savedStats };
      this.showWelcomeModal = false;
    },

    /**
     * Starts a brand-new session with a fresh ID and zeroed score.
     */
    async startFresh() {
      if (this.sessionId) {
        fetchWithTimeout('/api/reset-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: this.sessionId }),
        }).catch(() => {});
      }

      this.sessionId = generateSessionId();
      localStorage.setItem(LOCAL_STORAGE_KEY, this.sessionId);

      this.stats = { total: 0, correct: 0 };
      this.showWelcomeModal = false;
      this.gameEnded = false;
      this.fetchError = null;

      if (this.hasAnswered) {
        this.fetchNext();
      }
    },

    /**
     * Builds the `allAnswers` array by combining incorrect and correct
     * answers, then shuffling for randomness.
     */
    shuffleAnswers() {
      if (!this.currentQuestion) return;

      const incorrect = this.currentQuestion.incorrect_answers || [];
      const correct = this.currentQuestion.correct_answer;
      this.allAnswers = shuffleArray([...incorrect, correct]);
    },

    /**
     * Handles the user selecting an answer. Updates local score
     */
    async selectAnswer(answer) {
      if (this.hasAnswered) return;

      this.hasAnswered = true;
      this.selectedAnswer = answer;
      this.isCorrect = answer === this.currentQuestion.correct_answer;
      this.stats.total++;
      if (this.isCorrect) this.stats.correct++;

      try {
        const res = await fetchWithTimeout('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: this.currentQuestion.question,
            userAnswer: answer,
            isCorrect: this.isCorrect,
            sessionId: this.sessionId,
          }),
        });
        if (!res.ok) {
          console.error('[trivia] Save returned status', res.status);
        }
      } catch (err) {
        console.error('[trivia] Failed to save progress:', err.message);
      }
    },

    /**
     * Fetches the next question from the API, passing the current session ID
     * so the server can avoid repeating questions.
     */
    async fetchNext() {
      this.loading = true;
      this.fetchError = null;

      try {
        const res = await fetchWithTimeout(
          `/api/trivia?sessionId=${encodeURIComponent(this.sessionId)}`
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          this.fetchError = err.message || `Server error (${res.status}). Please try again.`;
          return;
        }

        const data = await res.json();

        if (data && typeof data.question === 'string' && data.correct_answer && Array.isArray(data.incorrect_answers)) {
          this.hasAnswered = false;
          this.selectedAnswer = null;
          this.isCorrect = false;
          this.currentQuestion = data;
          this.shuffleAnswers();
        } else {
          this.fetchError = 'Received an unexpected response. Please try again.';
        }
      } catch (error) {
        console.error('[trivia] Error fetching question:', error.message);
        this.fetchError = 'Could not reach the server. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Ends the current game session and shows the results summary.
     */
    endGame() {
      this.gameEnded = true;
    },

    /**
     * Calculates the user's accuracy as a whole-number percentage.
     */
    calculatePercentage() {
      if (this.stats.total === 0) return 0;
      return Math.round((this.stats.correct / this.stats.total) * 100);
    },
  };
}
