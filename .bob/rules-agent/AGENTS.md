# Project Coding Rules (Non-Obvious Only)

- **3-file split is mandatory**: `index.html` (structure), `style.css` (custom styles), `script.js` (logic). Do not inline JS or CSS back into the HTML.
- `index.html` must load Tailwind via CDN `<script>` tag, `style.css` via `<link rel="stylesheet">`, and `script.js` via `<script src="script.js" defer>`.
- No `fetch`, `XMLHttpRequest`, or WebSocket anywhere — spec explicitly forbids external calls (privacy).
- Conversion must be **bidirectional**: implement lookup tables for both 全角→半角 and 半角→全角; regex alone is insufficient for katakana.
- Half-width katakana dakuten/handakuten (ﾞﾟ) are separate code points — merge them with the preceding character before mapping to full-width.
- Default checkbox state must be coded accurately: collapse-blank-lines starts **unchecked**; all others start **checked**.
- Copy feedback must be UI-based (CSS class toggle or temporary text swap), not `window.alert()`.
- Character count spans must reflect output length after transformation, not input length.
- Clipboard write uses `navigator.clipboard.writeText()` — no other external API calls permitted.
