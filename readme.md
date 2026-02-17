# Seinfeld Trivia: The App About Nothing

Built with **Alpine.js**, and **Tailwind CSS**.

## Features

### Core Gameplay
- 🎬 **Episode Context:** Every question displays the exact Season and Episode title it originates from.
- 🟢🟡🔴 **Dynamic Difficulty:** Questions are color coded (Green/Yellow/Red) based on difficulty level.
- ⚡ **Instant Loading:** Server Side Rendering for the first question, AJAX for subsequent ones — no page reloads.
- 🔁 **Question Deduplication:** The server tracks which questions each session has seen and avoids repeats until the pool is exhausted.
- 🎚️ **Difficulty & Season Filtering:** API supports optional `difficulty` (1-3) and `season` query parameters.
- 📱💻 **Responsive Design:** Tailwind CSS layout works on mobile and desktop.
- ♿ **Keyboard Accessible:** Focus rings, ARIA labels, and live regions for screen readers.

### Session Management
- 💾 **Session Persistence:** Saves progress to a local JSON file with a write queue to prevent corruption.
- 🔄 **Resume Capability:** Detects previous sessions and offers to continue or start fresh.
- 📊 **Live Statistics:** Tracks correct/incorrect answers and accuracy percentage in real time.
- 🧾 **End Game Summary:** Detailed breakdown of performance with an accuracy progress bar.
- 🧹 **Auto Pruning:** Session file is capped at 10,000 entries — oldest are removed automatically.
