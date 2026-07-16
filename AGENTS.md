# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project

3-file static web app — no build step, no server, no package manager.
Spec lives in [`jp-text-formatter.md`](jp-text-formatter.md).

## File Structure

```
index.html   # HTML skeleton + Tailwind CSS CDN <link> + <script src="script.js">
style.css    # Custom styles and animations (linked from index.html)
script.js    # All conversion logic and event handling (loaded from index.html)
```

## Stack

- Vanilla HTML5 / CSS3 / ES6+ JavaScript — no framework, no bundler
- Tailwind CSS via CDN only (no `tailwind.config.js`, no PostCSS)
- Zero external HTTP calls at runtime (privacy requirement — all processing is local)

## Functional Requirements (non-obvious details from spec)

- Conversion table must handle **both directions**: 全角英数字↔半角英数字 AND 半角カタカナ↔全角カタカナ.
- Default checkbox states matter:
  - ON by default: 英数字半角化, カタカナ全角化, 全角スペース→半角スペース, 行頭末トリム
  - OFF by default: 連続改行を1つにまとめる
- Copy button must give visual feedback (toast or button text change — not `alert()`).
- Character counts (input and output) must update in **real-time**.
- Layout must be responsive (PC + smartphone); input/output areas side-by-side on wide screens.

## No Build / Test Commands

No build toolchain. Open `index.html` directly in a browser to verify.
