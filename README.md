# JEE Focus Pro

A 100% production-ready, ultra-premium Progressive Web App (PWA) designed for JEE Aspirants. Features a stunning Glassmorphism UI, offline capabilities, study tracking, and strict privacy (100% local storage).

## Deployment Instructions (GitHub Pages)

This project requires **zero** build steps, NPM, or external dependencies. 

1. Create a new repository on GitHub.
2. Upload exactly these 6 files to the root of the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `manifest.json`
   - `service-worker.js`
   - `README.md`
3. Go to your repository **Settings** > **Pages**.
4. Under **Source**, select `Deploy from a branch`.
5. Select `main` (or `master`) as the branch and `/ (root)` as the folder. 
6. Click **Save**. 

Within 1-2 minutes, GitHub will generate a link (e.g., `https://yourusername.github.io/yourrepo/`). 

### Progressive Web App (PWA) Installation
Visit the live GitHub Pages link on your iPhone (Safari) or Android (Chrome). 
- **iOS:** Tap the `Share` button and select `Add to Home Screen`.
- **Android:** A prompt will appear saying `Add to Home screen`, or tap the three dots and select `Install App`.

Once installed to the home screen, the app will function entirely offline.

## Core Features Implemented
* **Premium UI:** Apple-inspired frosted glassmorphism, dynamic gradients, CSS spring animations, and an AMOLED Dark Mode that toggles instantly.
* **Persistent Storage Engine:** Autosaving local state engine that tracks study streaks, daily hours, and tasks with robust JSON import/export functionality to prevent data loss.
* **Fully Customizable Focus System:** Configurable interval timer (25m, 50m, 90m, or Custom) that safely integrates with LocalStorage, browser notifications, and device vibration.
* **Smart Timetable:** Dynamic, state-driven rendering system that allows users to add and delete syllabus-specific tasks seamlessly. 
* **Zero-Dependency Ecosystem:** All SVG icons are injected inline via Base64 in the manifest and generated purely via CSS in the app to guarantee a 0-byte external network footprint for true offline caching.
