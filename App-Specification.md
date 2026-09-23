# Boli Bhasha — Mobile App Specification

**A Duolingo-style multilingual learning app for Indian third-language learners (Grades 5–8), with gamified competition and two additional mini-games.**

Version: 0.2 (draft) · Companion to the working web prototype in this folder (`index.html`, `app.js`, `styles.css`, `assets/`)

---

## 1. Product Overview

### 1.1 What it is
Boli Bhasha teaches Indian regional languages — **Telugu, Kannada, Bengali, Malayalam, Odia, and Sanskrit** — to students in Grades 5–8 who are learning one as their mandated third language under India's three-language formula. Lessons are short (2–3 minutes), gamified, and guided by a cast of ocean-creature mascots, each with a distinct teaching job.

### 1.2 Who it's for
- **Primary users:** students aged ~10–14, studying a third language at school.
- **Secondary users (v2+):** teachers/parents who want a class or family leaderboard view.

### 1.3 Core promise
Learn a little, every day, in a language that's written in English letters but *spoken* correctly — with real competition (points, levels, leaderboards) to keep coming back, and a couple of unrelated arcade games as a reward space.

### 1.4 What already exists (web prototype)
The current prototype already implements:
- 6 languages, each with 4 vocabulary units (greetings, numbers, family, food) and 2 hospitality phrases.
- English-letter spellings shown on screen; correct native pronunciation played via speech synthesis (spokenForm never shown, only heard).
- 5 lesson exercise types: New word intro, Meaning check, Spelling check, Listening check, Match pairs.
- A 5-character mascot crew (see §2), each responsible for a specific part of the experience.
- Hearts (5/day), a login streak, and a spaced-repetition "Recap" mode.
- All state is local (`localStorage`) — **there are no accounts and no server**, which is the main gap this spec closes for a real mobile app (see §7).

This document extends that prototype into a full mobile app spec, and adds the features requested: **games (Chess, Learn Music), an XP/level system, and a Top 10 leaderboard dashboard.**

---

## 2. The Crew (existing, keep as-is)

Traced from the user's Figma "water theme cartoon characters" set. Each mascot owns one job so the student always knows who's talking.

| Mascot | Creature | Role | Owns |
|---|---|---|---|
| **Luna** | Jellyfish (pink) | The warm & wise guide | Daily blessing, streak-saver, hospitality phrases, proverbs |
| **Ollie** | Octopus (purple) | The precision pro | Grammar tips, spelling checks, "why was that wrong" |
| **Finn** | Clownfish (orange) | The friendly guide | Introduces new words, listening drills, encouragement |
| **Pip** | Crab (teal) | The playful mascot | Quizzes, match games, celebrations, streak nudges |
| **Sandy** | Turtle (green) | The revision & streak coach | Recap rounds, spaced review |

New feature owners added by this spec (§4):
| Mascot | New job |
|---|---|
| **Ollie** | Hosts **Chess** (strategy fits "the precision pro") |
| **Luna** | Hosts **Learn Music** (folk songs fit "hospitality & culture") |
| **Pip** | Hosts the **Games Zone** entry point and all XP/level celebrations |

---

## 3. Gamification System (new)

This is the main system the current prototype lacks. It should feel like Duolingo's loop: **do a lesson → earn XP → see your level/league move → check the leaderboard → come back tomorrow.**

### 3.1 XP (points)
Points are awarded per activity, matching the values already coded in the prototype (keep these for continuity):

| Activity | XP | Bonus |
|---|---|---|
| New-words lesson (Lesson 1 or 2 of a unit) | 10 | +5 if 100% accuracy |
| Unit quiz (Lesson 3) | 15 | +5 if 100% accuracy |
| Sandy's Recap round | 8 | +4 if 100% accuracy |
| Chess game won (vs. bot or friend) | 15 | +5 if won in under 15 moves |
| Music sing-along completed | 10 | +5 if perfect rhythm score |
| Daily streak kept (login + 1 activity) | 5 | +10 at 7-day, +25 at 30-day, +100 at 100-day milestones |

### 3.2 Levels
A single **account level** derived from lifetime XP, themed around the ocean world so it stays consistent with the crew:

| Level | XP required | Title |
|---|---|---|
| 1 | 0 | Tide Pool Beginner |
| 2 | 100 | Shallow Water Swimmer |
| 3 | 250 | Reef Explorer |
| 4 | 500 | Current Rider |
| 5 | 900 | Coral Navigator |
| 6 | 1,400 | Deep Sea Diver |
| 7 | 2,000 | Pearl Collector |
| 8 | 2,800 | Current Master |
| 9 | 3,800 | Abyss Wanderer |
| 10+ | +1,200 per level | Ocean Sage (title repeats with a number, e.g. "Ocean Sage III") |

The level badge shows on the profile and next to the student's name on the leaderboard. Leveling up triggers a full-screen celebration hosted by **Pip**.

### 3.3 Per-language mastery (crown levels)
Separate from the account level, each **unit** in each **language** tracks mastery, reusing the existing 3-lesson structure:
- 0 crowns: not started
- 1 crown: New words + More words + Quiz all completed once
- 2–5 crowns: redo the unit's quiz later (e.g. after a Recap) at 100% accuracy to earn extra crowns, up to 5

Crowns are what "Progress by language" on the Me tab should visualize (replacing the current lessons-done fraction).

### 3.4 Leagues (weekly competitive cohorts)
Every Monday, students are grouped into leagues of ~30 similarly-ranked peers (by recent weekly XP). At the end of the week:
- **Top 10** in the league promote to the next league up.
- **Bottom 5** demote to the league below.
- Everyone else stays.

League tiers (low → high), reusing ocean-colour names to match the theme:
`Tide Pool → Lagoon → Reef → Current → Deep Blue → Abyss → Coral Crown → Pearl → Leviathan`

New accounts start in Tide Pool. This is the main "compete against people like me" loop, separate from the global Top 10 (§3.5).

### 3.5 Leaderboard Dashboard (Top 10) — the specific ask
A dedicated **Leaderboard** screen (new tab or reachable from the Me tab) with:
- **Two views, switchable by tab:** *This week* (resets every Monday, drives league promotion) and *All-time*.
- **Top 10 list**: rank, avatar, display name, level badge, points. Ranks 1–3 get a visual medal treatment (gold/silver/bronze).
- **"You" row**: if the student isn't in the visible Top 10, pin their own row (rank, points, points-to-next-rank) at the bottom of the list, sticky.
- **Scope toggle (v2):** Global / My School / My Class — v1 ships Global only, since school/class grouping needs a roster system (§6.4).
- Data source: server-side aggregation (§7), refreshed at minimum every few minutes; do not compute this from on-device data.

### 3.6 Streaks (existing, formalize)
Already implemented client-side (5 hearts/day, streak counter, Luna's once-daily refill). For the mobile app: move streak state to the server so it survives reinstall/device change, and add a push notification ~2 hours before local midnight if the day's streak isn't secured yet ("Pip" voice).

### 3.7 Badges / Achievements (new, lightweight for v1)
Simple boolean badges shown on the profile, awarded automatically:
- **First Steps** — finish your first lesson
- **Week One** — 7-day streak
- **Century** — 100-day streak
- **Perfectionist** — 10 lessons in a row at 100% accuracy
- **Polyglot-in-training** — reach crown 1 in three different languages
- **Checkmate** — win your first chess game
- **In Tune** — complete your first music sing-along

---

## 4. New Feature: Games Zone

A new tab (or a card on the Learn tab, "Pip's Games Zone") holding two mini-games. They are deliberately **not language-exercise screens** — they're a reward space students unlock and visit for a change of pace — but each is given a light, optional tie-back to the core product so it doesn't feel bolted on.

### 4.1 Chess (hosted by Ollie)
- Standard chess rules; **vs. a bot (3 difficulty levels)** for v1, **vs. a friend (pass-and-play, then online)** for v2.
- Unlocks at **Level 3 (Reef Explorer)** so it reads as a reward, not a distraction from day-one learning.
- **Language tie-in (optional toggle, default on):** long-press/tap-and-hold a piece to hear Ollie say its name in the student's chosen language (e.g. the word for "king", "horse", "elephant" — many already map naturally to Indian chess/chaturanga piece names). This is flavor, not graded.
- Awards XP per §3.1; does not affect language crowns or streak.
- Needs: a chess engine/rules library (e.g. `chess.js` equivalent) + a simple bot (even a basic minimax/greedy bot is enough for v1) — no need to build one from scratch.

### 4.2 Learn Music (hosted by Luna)
- Teaches **regional folk rhymes and simple children's songs** in the student's chosen language — thematically the strongest tie-in to the core app, since it reuses the "English letters, real audio" pattern already built for vocabulary.
- Two modes:
  1. **Sing-along:** lyrics shown in English letters (same transliteration approach as the rest of the app), karaoke-style highlight synced to audio, optional recording + simple pitch/rhythm scoring (v2; v1 can just be listen-and-follow with a "tap the beat" mini-game for XP).
  2. **Sa-re-ga-ma basics (v2):** a short, playful intro to the Indian solfège (sargam) — tap-the-note games, no notation reading required.
- Unlocks at **Level 2 (Shallow Water Swimmer)**.
- Needs: licensed or public-domain folk song audio + lyrics per language (content sourcing is a real task — flag as a content dependency, not just engineering).

### 4.3 Games Zone screen
- Grid of game cards (Chess, Learn Music, "More coming soon" placeholder), each showing lock state / unlock level if not yet unlocked.
- Entry point: new 5th tab, **or** a card at the top of the Learn tab if the team wants to keep the tab bar at 4 items — recommend a 5th tab given how central this becomes to retention.

---

## 5. Updated Information Architecture

Proposed tab bar (5 tabs, replacing the current 4):

1. **Learn** — language path (unchanged from prototype) + Sandy's Recap card
2. **Games** — *(new)* Chess, Learn Music, future games
3. **Leaderboard** — *(new)* Top 10 dashboard, league standing, "You" row
4. **Luna's Cove** — hospitality phrases, streak saver (unchanged)
5. **Me** — profile, level badge, crowns per language, badges, settings

**Crew tab** (currently a top-level tab) moves inside **Me → Meet the Crew**, since it's reference content, not something visited daily — this makes room for Games and Leaderboard without a 6-item tab bar.

### Full screen list
| Screen | Purpose |
|---|---|
| Onboarding (3 steps) | Pick language → pick grade → meet the crew |
| Learn (home) | Unit path, blessing, recap card |
| Lesson player | The 5 exercise types (unchanged) |
| Lesson/Recap complete | XP earned, streak, level-up celebration if applicable |
| Games Zone | Grid of games |
| Chess | Board, move list, bot difficulty, piece-name toggle |
| Learn Music | Song list per language → sing-along player |
| Leaderboard | Top 10 (weekly/all-time), league banner, "You" row |
| Luna's Cove | Phrases, streak saver, Ollie's grammar note |
| Me / Profile | Level, XP, streak, crowns per language, badges, crew reference, settings, sign out |
| Settings | Language, grade, notifications, account, sign out, delete account |
| Auth (new) | Sign up / log in (needed once accounts exist — see §7) |

---

## 6. Data Model (for backend design)

This is new — the prototype has no accounts, so this section defines what a real backend needs.

### 6.1 `User`
```
id, display_name, avatar (crew-icon choice or default), grade (5-8),
primary_language, created_at, last_active_at,
total_xp, current_level, current_streak, longest_streak,
hearts_remaining, hearts_reset_at, league_id, school_id (nullable, v2)
```

### 6.2 `Progress`
One row per (user, language, unit, lesson):
```
user_id, language_code, unit_index, lesson_index,
completed_at, accuracy, crowns_earned
```

### 6.3 `XPEvent`
Append-only log, source of truth for leaderboards and streaks:
```
user_id, source ("lesson" | "quiz" | "recap" | "chess" | "music" | "streak_bonus"),
xp_awarded, occurred_at
```
Weekly/all-time leaderboard totals are aggregated (materialized view or scheduled job) from this table — never trust a client-submitted total.

### 6.4 `League` / `LeagueMembership` (v1 can be a simple weekly cron job)
```
League: id, tier_name, week_start_date
LeagueMembership: league_id, user_id, weekly_xp, rank_at_week_end
```

### 6.5 `Badge` / `UserBadge`
```
Badge: id, name, description, icon
UserBadge: user_id, badge_id, earned_at
```

### 6.6 `GameResult`
```
user_id, game ("chess" | "music"), result (win/loss/draw or score),
xp_awarded, played_at
```

---

## 7. Technical Recommendation

The current prototype is a single-page HTML/CSS/JS app with **no backend**. Points/levels/leaderboards **require** server-side state — this is the single biggest architecture change from prototype → real app.

### 7.1 Suggested stack
- **Client:** React Native (Expo) — lets the team reuse most of the existing UI logic and JS mental model from the prototype, ships to iOS + Android from one codebase. (Flutter is a reasonable alternative if the team prefers Dart; either is fine, don't build native-per-platform for v1.)
- **Backend/DB:** Supabase or Firebase — both give auth, a Postgres/NoSQL database, and realtime subscriptions (useful for the leaderboard updating live) with minimal ops overhead for a small team.
- **Auth:** email/OTP or Google/Apple sign-in; students this age should not need to manage passwords — prefer OTP or a class-code + PIN flow (v2, for teacher-issued rosters).
- **Speech:** keep using on-device TTS (`expo-speech` / platform TTS) exactly like the prototype's `speechSynthesis` — same "no native-script voice on this device" fallback pattern should carry over.
- **Chess engine:** a lightweight JS chess rules/bot library rather than building one from scratch.
- **Push notifications:** Expo Notifications (or FCM/APNs directly) for the streak reminder in §3.6.

### 7.2 Migration note
Existing `localStorage` progress in the web prototype should be importable on first login (read it, upload as `XPEvent`/`Progress` rows) so early testers don't lose their demo progress — small nice-to-have, not a blocker.

---

## 8. Out of Scope for v1

Call these out explicitly so scope doesn't creep silently:
- Real-time multiplayer chess (ship bot-only first; pass-and-play if time allows)
- Teacher/school dashboards and class rosters
- Pitch-accurate singing score in Learn Music (ship listen-and-follow first)
- More than 2 mini-games
- Monetization (ads/subscription) — not addressed here; flag as a separate decision

---

## 9. Open Questions (need the user's decision before implementation)

1. **Games scope for v1:** bot-only chess and listen-along music, or is real-time multiplayer/pitch-scoring a launch requirement?
2. **Accounts:** email/OTP, or Google/Apple sign-in only, or a school-issued class code?
3. **Music content sourcing:** who provides/licenses the folk songs per language — is this content the user already has, or does it need to be commissioned/licensed?
4. **Leaderboard scope for v1:** Global only, or does "compete" specifically mean classmates/friends from day one?
5. **Platform:** iOS + Android both at launch, or one first?

---

## 10. Suggested Build Order (phased)

1. **Phase 1 (done):** Web prototype — 6 languages, crew, lessons, recap. *(this folder)*
2. **Phase 2:** Accounts + backend; port XP/streak/hearts to server-authoritative state; ship the Leaderboard (Top 10, weekly + all-time) and account Levels.
3. **Phase 3:** Leagues (weekly promotion/demotion) + Badges.
4. **Phase 4:** Games Zone — Chess first (self-contained, no content dependency), then Learn Music (needs song content sourced/licensed in parallel).
5. **Phase 5:** Native mobile polish — push notifications, offline lesson caching, app store submission.
