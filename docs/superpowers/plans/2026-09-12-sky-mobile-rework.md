# Sky Mobile Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Sky-requested rework for the shared phone home, SIM Catch game, results/replay flow, and video-call incoming/end states.

**Architecture:** Keep the existing React/Vite page/component structure. Extract only small deterministic game helpers/configuration where useful, replace drag/collision gameplay with directly tappable falling collectibles, keep one shared Home/Lock screen, and use CSS/local SVG fallbacks for missing brand assets.

**Tech Stack:** React, Vite, plain CSS, WebAudio, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-12-sky-mobile-rework-design.md`

## Global Constraints

- Game duration: exactly 30 seconds.
- Intro duration: 8.3 seconds.
- Countdown: 3, 2, 1 only.
- Standard SIM: +1 SIM; 5G bonus: +10 SIM; network bonus: x2 current SIM count.
- No minimum target, `/35`, pass/fail state, or visible attempt numbering.
- Maximum two completed games per unlocked session; first result offers `Riprova`, second result auto-resets after 5 seconds.
- Current fallback PIN remains `1234` until Sky supplies the final value.
- `Sky Text` is the preferred font-family with system fallback; no font binary is added until supplied.
- `Giga consumati` displays `—` until Sky provides final logic/copy.
- Final claim remains `Con Sky Mobile hai _____ _____.` until supplied.
- Browser/OS chrome cannot be removed by app CSS; final device uses kiosk/fullscreen mode.

---

### Task 1: Deterministic game rules and test hook

**Files:**
- Create: `src/gameLogic.js`
- Create: `test/gameLogic.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `applyCollectible(total, type)` where type is `sim | 5g | network`.
- Produces: `canReplay(completedGames)`.

- [ ] **Step 1: Write failing Node tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { applyCollectible, canReplay } from '../src/gameLogic.js'

test('standard SIM adds one', () => assert.equal(applyCollectible(7, 'sim'), 8))
test('5G adds ten', () => assert.equal(applyCollectible(7, '5g'), 17))
test('network doubles current SIM total', () => assert.equal(applyCollectible(7, 'network'), 14))
test('only one replay is allowed', () => {
  assert.equal(canReplay(1), true)
  assert.equal(canReplay(2), false)
})
```

- [ ] **Step 2: Run `node --test` and verify RED because `src/gameLogic.js` does not exist.**
- [ ] **Step 3: Implement the minimal helpers and add `"test": "node --test"` to package scripts.**
- [ ] **Step 4: Run `npm test` and verify GREEN.**

### Task 2: Shared Home requested app set and Catch 'em all launcher

**Files:**
- Modify: `src/components/PhoneHome.jsx`
- Modify: `scripts/fetch-apple-icons.mjs`
- Create: `public/app-icons/mysky.svg`
- Create: `public/app-icons/skytoday.svg`
- Create: `public/app-icons/mysodexo.svg`
- Create: `public/app-icons/catch-em-all.svg`

**Interfaces:**
- Shared by both game and videocall via `PhoneHome`.

- [ ] **Step 1:** Remove Safari and Messages from the main `APPS` grid while retaining them in `DOCK_APPS`.
- [ ] **Step 2:** Ensure Spotify, FaceTime, Teams, X Factor, My Sky, Sky Today, YouTube and My Sodexo are present.
- [ ] **Step 3:** Rename the special launcher label to `catch 'em all` and render SIM-based colored local artwork.
- [ ] **Step 4:** Add YouTube to the App Store fetch script using iOS id `544007664`; keep local SVGs for requested brands not guaranteed by the fetch flow.

### Task 3: Replace game with 30s tap-to-collect + bonuses

**Files:**
- Modify: `src/components/GameExperience.jsx`
- Replace: `src/game-rules.css`

**Interfaces:**
- Consumes: `applyCollectible`, `canReplay` from `src/gameLogic.js`.

- [ ] **Step 1:** Set game to 30 seconds, countdown to 3, intro to 8300ms.
- [ ] **Step 2:** Remove claim from intro and show exactly `Prendi più SIM possibili prima dello scadere del tempo!`.
- [ ] **Step 3:** Remove catcher, pointer-drag listeners, collision logic, points score, target and attempt state.
- [ ] **Step 4:** Spawn typed falling collectibles (`sim` common, `5g` rare, `network` rare) and make each item an actual pointer/touch target.
- [ ] **Step 5:** On tap, call `applyCollectible`, remove the item immediately, play standard/bonus sounds, and render a short tap/boost visual effect.
- [ ] **Step 6:** HUD contains only `SIM PRESE` and `TEMPO`.
- [ ] **Step 7:** End every game in the same neutral results state with SIM total, `Giga consumati —`, final claim, and `Riprova` only after game 1. After game 2, auto-reset after 5s.

### Task 4: Full-screen incoming videocall + slide to answer

**Files:**
- Modify: `src/components/VideoCallExperience.jsx`
- Modify: `src/experience.css`

**Interfaces:**
- Existing prerecorded video/question/camera branch stays unchanged after answering.

- [ ] **Step 1:** Replace `PhoneHome` incoming banner with full-screen incoming presentation containing the talent placeholder/photo area and name.
- [ ] **Step 2:** Add a horizontal slide-to-answer track; answer only after the drag crosses the threshold.
- [ ] **Step 3:** Keep ringtone and 10-ring timeout.
- [ ] **Step 4:** Remove `Grazie!` from the ended screen and preserve automatic reset.

### Task 5: Brand/fallback polish and verification

**Files:**
- Modify: `src/experience.css`
- Modify: `src/ios-home-polish.css` only if necessary for grid density.

- [ ] **Step 1:** Set Sky branding surfaces to `font-family: "Sky Text", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif` without bundling a font file.
- [ ] **Step 2:** Ensure no app-rendered black top/bottom bar is introduced; keep browser/OS chrome outside app responsibility.
- [ ] **Step 3:** Run `npm test`.
- [ ] **Step 4:** Run `npm run build`.
- [ ] **Step 5:** Search playable source for `/35`, `TARGET_SIMS`, `Tentativo`, `Raccogli almeno 35`, and `Grazie!`; none may remain in active UI code.
