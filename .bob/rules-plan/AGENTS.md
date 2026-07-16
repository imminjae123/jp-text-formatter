# Project Architecture Rules (Non-Obvious Only)

- Architecture is intentionally zero-dependency: no React, Vue, bundler, or server. Any plan introducing a build pipeline violates the spec.
- Files are split for maintainability but served as plain static files — no module bundling; `script.js` uses globals, not ES modules (to avoid CORS issues when opening `index.html` directly from the filesystem without a server).
- All state lives in DOM (checkbox values + textarea content) — no external state store needed or appropriate.
- Katakana conversion requires a character map (not pure regex): half-width katakana are single Unicode code points (U+FF65–U+FF9F); combining dakuten/handakuten (ﾞﾟ) must be merged before mapping to full-width.
- The "real-time" character count requirement means the transformation pipeline runs on every `input` event — design for performance on large pastes.
- `style.css` is for custom animations and overrides only; base styling comes from Tailwind utility classes in the HTML.
