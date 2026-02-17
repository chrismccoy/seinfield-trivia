/**
 * Seinfeld Trivia Application
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const triviaRoutes = require('./routes/triviaRoutes');
const errorHandler = require('./middlewares/errorHandler');
const sessionService = require('./services/sessionService');
const { DEFAULT_PORT } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', triviaRoutes);

// Error handling
app.use(errorHandler);

/**
 * Init the persistent storage and starts the HTTP server.
 */
async function startServer() {
  try {
    await sessionService.initStorage();

    app.listen(PORT, () => {
      console.log(`
      ---------------------------------------
       Seinfeld Trivia Running!
       Server: http://localhost:${PORT}
       Mode:   ${process.env.NODE_ENV || 'development'}
      ---------------------------------------
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
