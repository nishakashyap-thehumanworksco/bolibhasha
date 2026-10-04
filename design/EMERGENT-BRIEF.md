# Boli Bhasha — Emergent build brief (demo build)

Build a **mobile-first app demo** (Expo / React Native or a mobile-width web app, your choice) that teaches Indian regional languages to students in Grades 5–8. Goal: a polished, clickable **demo** with local/mock data, no real auth or backend required.

Languages: Telugu · Kannada · Bengali · Malayalam · Odia · Sanskrit. Words are **shown in English letters** and **spoken aloud** in the regional pronunciation via on-device text-to-speech. The learner never has to read the native script.

Reference: the existing plain HTML/CSS/JS prototype and `App-Specification.md` are in the repo `nishakashyap-thehumanworksco/bolibhasha`. Reuse its lesson content (6 languages, 4 units each: greetings, numbers, family, food; 2 hospitality phrases each) and its XP/level/streak rules.

## 1. Experience concept: "you are inside the deep ocean"

The whole app is one water column. The learner *dives* as they progress.

- **Depth = progress.** Units are depth zones: Unit 1 Sunlit Zone (0–200 m), Unit 2 Twilight Zone (200 m), Unit 3 Midnight Zone, Unit 4 Abyss. The background darkens and gets more bioluminescent the deeper the unit.
- **Surface light:** soft god-rays and caustics at the top of every screen, fading out with depth.
- **Ambient life:** slow rising bubbles, drifting glowing plankton, subtle parallax on scroll (background moves slower than content). Keep motion gentle; respect "reduce motion".
- **Glass UI:** cards, tab bar and chips are frosted glass (blur + soft cyan border + inner highlight). Nothing is a flat white card.
- **Glow, not shadow:** primary actions, the current lesson orb and the speaker button emit a cyan bioluminescent glow.
- **Sound (optional but great for demo):** soft underwater ambience, bubble pop on a correct answer, a gentle "drown" sound on a wrong one, with a mute toggle.

## 2. Design tokens

| Token | Value |
|---|---|
| Water surface → abyss gradient | `#14b4c8 → #0b78a0 → #09508a → #06335f → #041f44 → #020f26` |
| Text | `#eafcff` (muted `#a9d9e6`, labels `#9fd6e4`) |
| Glow cyan (primary) | `#8afcef → #27d3c6`, button text `#03303a` |
| Gold (XP, streak, crowns, "You") | `#ffe48f → #ffc23d`, text `#3a2600` |
| Success | `#b4ffd9 → #58d39b` |
| Error | `#ff8fa0 / #ff6b82` (soft, never harsh red) |
| Glass | `linear-gradient(rgba(150,240,255,.18), rgba(20,90,150,.30))`, border `rgba(165,245,255,.30)`, blur 14px, radius 20px |
| Display font | Baloo 2 (700–800) |
| Body font | Hind (400–600) |
| Touch targets | ≥ 44px, primary buttons 56px |

Contrast: all text on glass must stay ≥ 4.5:1. Colour is never the only signal (icons + labels with state).

## 3. Mascots — must look real

Five ocean creatures. Each has **one job** so the learner always knows who is talking. Current SVGs are in `design/mascots/` as a *placeholder style guide*; **replace them with higher-fidelity, realistic-but-friendly characters** (generate with your image tools: glossy 3D-render look, true-to-species anatomy, subsurface glow, wet specular highlights, soft rim light, big expressive eyes). Output transparent PNG/WebP at 2× or 3×, plus a **front-facing neutral**, **talking**, and **celebrating** pose for each. Keep proportions and palette consistent across the set.

| Mascot | Species | Palette | Job |
|---|---|---|---|
| **Luna** | Moon jellyfish, translucent pink-violet bell, glowing tentacles | pink `#f6a8e6`, violet `#b24fd6` | Daily blessing, hospitality phrases, streak saver, hosts Learn Music |
| **Ollie** | Octopus, purple, textured skin, suckers | `#9b4fe0` / `#4b1d96` | Grammar tips, spelling checks, answer explanations, hosts Chess |
| **Finn** | Clownfish, orange with white bands | `#ff8a1f` | Introduces new words, listening drills, encouragement |
| **Pip** | Crab, teal shell | `#17b8d0` | Quizzes, match games, celebrations, hosts the Games Zone |
| **Sandy** | Sea turtle, green shell with hex scutes | `#3f9a3a` | Spaced-repetition recap rounds, streak coach |

Behaviour: idle bob (±6px, 4s), speaking state = bigger bob + glow + speech dots. Mascots **speak** (text bubble + optional TTS); they never sit as decoration.

## 4. Screens (bottom tab bar: Learn · Games · Ranks · Cove · Me)

Tab bar is floating frosted glass, active tab = glowing cyan pill.

1. **Learn (home).** Top row: language chip (Telugu ▾) + glass stat pills: streak 🔥, XP ⚡, hearts ♥. Luna's blessing card. Current unit card (zone name + depth, crowns 0–5, Finn). Lesson path: zig-zag glowing orbs joined by a dotted current line. Done = gold orb with check, current = pulsing cyan orb with a floating START tag, locked = dim glass orb. Next unit teaser (locked). Bottom: Sandy's recap card ("6 words are fading · 2 min · GO").
2. **Lesson player.** Close X, green progress bar, hearts. Finn asks in a speech bubble. Big word card with a pulsing glowing speaker button, the English-letter word (e.g. *Namaskaram*) and "Tap to hear it". 3 glass answer buttons. Feedback is a **bottom sheet** (green glass for right, soft coral for wrong) with Ollie's one-line *why* and a CONTINUE button. Exercise types: new-word intro, meaning check, spelling check, listening check, match pairs.
3. **Lesson complete.** Golden light bursting from above, Pip celebrating, tiles (+XP, accuracy, streak), level progress bar ("55 XP to unlock Chess"), buttons SEE MY RANK and Back to the path. Confetti = glowing plankton/bubbles.
4. **Games Zone (Pip).** Learn Music (Luna, unlocked at Lv 2) and Chess (Ollie, unlocks at Lv 3). A locked game shows a dimmed mascot, a lock badge and a progress bar with "55 XP to go". Third card "More coming soon". Games never affect streak.
5. **Leaderboard.** Segmented control This week / All-time. League banner (Reef League · Top 10 swim up · ends in 2d 4h). Top 10 rows with rank, avatar, name, level pill, points; ranks 1–3 glowing gold/silver/bronze medals. Your row is **pinned** at the bottom with "36 XP to pass #13".
6. **Me.** Avatar, name, level title, stat tiles (streak, total XP, badges), **Progress by language** (6 rows with progress bar + crowns), badges as glowing pearls (locked = dashed dim), "Meet the Crew" row, settings gear.
7. **Luna's Cove** (hospitality phrases, streak saver) and **Onboarding** (pick language → grade → meet the crew, dive-in animation).

## 5. Gamification rules (keep from spec)

- XP: new-words lesson 10 (+5 perfect), unit quiz 15 (+5), recap 8 (+4), chess win 15 (+5), music 10 (+5), daily streak 5.
- Levels (XP): 1 Tide Pool Beginner 0 · 2 Shallow Water Swimmer 100 · 3 Reef Explorer 250 · 4 Current Rider 500 · 5 Coral Navigator 900 · 6 Deep Sea Diver 1400 · 7 Pearl Collector 2000 · 8 Current Master 2800 · 9 Abyss Wanderer 3800 · 10+ Ocean Sage (+1200/level).
- Hearts 5/day, streak counter, level-up full-screen celebration hosted by Pip.
- Leagues: Tide Pool → Lagoon → Reef → Current → Deep Blue → Abyss → Coral Crown → Pearl → Leviathan.

## 6. Demo requirements

- Fully clickable end-to-end: Learn → Lesson → Complete → Ranks → Me, Games and tabs all reachable.
- Seed data: one demo learner "Sample Learner" (Lv 2, 195 XP, 13-day streak, Telugu unit 1 at lesson 3) and a 10-person mock leaderboard.
- TTS via the platform speech API; graceful fallback text if no regional voice exists ("Voice not installed on this device").
- Offline-capable demo, no sign-in. Phone viewport 390×844 first, scale up cleanly.
- Accessibility: real buttons, labels on icon-only controls, reduced-motion support, minimum 44px targets.

## 7. Out of scope for the demo

Real accounts, server leaderboard, multiplayer chess, pitch-scored singing, payments.

## 8. First deliverables, in order

1. Dive-in onboarding + Learn + Lesson loop working with real TTS.
2. New realistic mascot art set (5 characters × 3 poses).
3. Lesson complete + level-up celebration.
4. Ranks, Games Zone, Me.
5. Sound design + parallax polish.

Ask me anything that is ambiguous before starting; otherwise proceed with the defaults above.
