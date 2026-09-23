# Boli Bhasha

A Duolingo-style web app for learning Indian regional languages, built for students in Grades 5–8 studying a state-mandated third language.

**Languages:** Telugu · Kannada · Bengali · Malayalam · Odia · Sanskrit

Every word is *shown* in English letters and *spoken* in the real regional pronunciation via on-device text-to-speech — no need to read a new script to get started.

## The crew

| Mascot | Role |
|---|---|
| 🪼 **Luna** | Daily blessings, hospitality phrases, streak saver |
| 🐙 **Ollie** | Grammar tips, spelling checks, answer explanations |
| 🐠 **Finn** | Introduces new words, listening drills, encouragement |
| 🦀 **Pip** | Quizzes, match games, celebrations |
| 🐢 **Sandy** | Spaced-repetition recap rounds |

## Running it locally

This is a plain HTML/CSS/JS app — no build step, no dependencies.

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html` to open it directly in a browser.

## Project structure

```
index.html              page structure
styles.css               all styling
app.js                    app logic (lessons, state, crew, exercises)
assets/                  mascot artwork (SVG)
App-Specification.md    full product spec for the planned native mobile app
                         (gamification, leagues, leaderboard, Chess & Learn Music games)
```

## Status

Working web prototype. See `App-Specification.md` for the roadmap to a full native mobile app with accounts, XP/levels, a Top 10 leaderboard, and two mini-games (Chess, Learn Music).
