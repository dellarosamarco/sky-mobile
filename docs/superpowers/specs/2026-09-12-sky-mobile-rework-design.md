# Sky Mobile Rework Design

Date: 2026-09-12

## Scope

Implement the complete rework requested in the supplied "modifiche per gioco Sky Mobile" document across both experiences: Postazione 1 (game) and Postazione 2 (video call).

The goal is to keep the existing React/Vite structure, reuse the current shared lock screen and home components, and replace the parts of the game/call flows that conflict with the new requirements.

## Shared lock screen

- Keep the current passcode flow and current fallback PIN `1234` until Sky supplies the final PIN.
- Keep the passcode block moved upward.
- Remove app-rendered black top/bottom bars where present; browser/OS chrome is outside app control and the final installation should use kiosk/fullscreen mode.
- Preserve the current shared lock screen for both stations.

## Shared home screen

- Keep one shared `PhoneHome` component for both experiences.
- Rename the Sky launcher from `Sky Mobile` to `catch 'em all`.
- Replace the current Sky Mobile launcher artwork with a SIM-based colored icon matching the visual language of the game.
- Remove Safari and Messages from the main app grid while keeping them in the bottom dock.
- Keep/add these apps in the main grid: Spotify, FaceTime, Microsoft Teams, My Sky, X Factor, Sky Today, YouTube, My Sodexo.
- Keep existing decorative apps as needed to maintain a credible phone home screen unless they conflict with the requested grid.
- Use local/fallback vector artwork for requested apps for which a stable official App Store asset is not available in the existing icon-fetch flow. Do not block the implementation on missing external assets.

## Game intro

- Intro remains automatic and lasts 8.3 seconds.
- Remove the claim `Con Sky Mobile hai ...` from the intro.
- Replace the current minimum-target copy with: `Prendi più SIM possibili prima dello scadere del tempo!`
- Use `Sky Text` as the preferred font family for Sky Mobile branding, with the current system font stack as fallback until the authorized Sky Text font asset is supplied.
- After the intro, show a `3, 2, 1` countdown only.

## Gameplay

- One game lasts exactly 30 seconds.
- There is no minimum SIM target and no success/failure threshold.
- Remove the catcher/shopper and all drag-to-catch behavior.
- Falling collectible items are acquired by tapping/clicking them directly.
- Standard SIM: increases the displayed SIM total by 1.
- 5G bonus: increases the displayed SIM total by 10.
- Network bonus: doubles the currently collected SIM total.
- Bonus icons appear less frequently than normal SIMs.
- All collectible types receive immediate touch feedback; bonus items receive a stronger visual/audio boost effect.
- Keep the existing falling-item motion, but adapt spawning and hit handling to direct taps.
- HUD shows only the values relevant to the new game: `SIM PRESE` and remaining time. Remove `/35`, attempt number and `Raccogli almeno 35 SIM`.
- The score is the SIM total itself; remove the separate points score concept.

## Results and replay

- Results are always neutral/completion-based, not pass/fail.
- Remove the red X, `Non hai raccolto abbastanza SIM`, target comparison, and success/failure threshold logic.
- Results show:
  - `SIM prese` + final SIM total.
  - `Giga consumati` + temporary placeholder `—` until Sky supplies the final rule/copy.
  - Final claim area containing `Con Sky Mobile hai _____ _____.` until the final two words are supplied.
- A `Riprova` button is available after the first completed game.
- Maximum two completed games per unlocked session.
- After the second completed game, or after the user finishes the allowed replay cycle, return automatically to the lock screen after the results timeout.
- The UI must not show `Tentativo 1/2` or `Tentativo 2/2`.

## Video call incoming state

- Keep the same shared home icon layout as the game station.
- Replace the current incoming-call banner with a full-screen incoming-call presentation.
- Show the talent photo full-screen with name overlaid. Until final assets arrive, use a tasteful generated/local placeholder based on the existing talent initials/name data.
- Replace tap-to-answer with a phone-slider gesture: drag the phone control horizontally to answer.
- Keep the call timeout/ringtone behavior.
- Keep the current prerecorded-video, question/answer branching, self-view camera and automatic call-ending behavior.

## Video call end state

- Remove `Grazie!` from the final message.
- Keep `Chiamata terminata` and the automatic reset flow.

## Pending external inputs

The implementation must not be blocked by these missing assets/details:

- Final PIN from Sky.
- Authorized Sky Text font file.
- Final wording/rule for `Giga consumati`.
- Final two words for `Con Sky Mobile hai ...`.
- Final talent name/photo and any replacement prerecorded videos/questions.

Each pending input gets an explicit fallback in the implementation so it can be swapped later without restructuring the flow.

## Files / component boundaries

Expected primary changes:

- `src/components/PhoneHome.jsx` — requested apps, launcher rename/artwork, grid cleanup.
- `scripts/fetch-apple-icons.mjs` — official icon fetches where available.
- `src/components/GameExperience.jsx` — 30s direct-tap gameplay, bonuses, 3-2-1 countdown, results/replay flow.
- `src/components/VideoCallExperience.jsx` — full-screen incoming call and slide-to-answer, final copy.
- Existing CSS files (`experience.css`, `game-rules.css`, `ios-home-polish.css`, `qa-fixes.css`, etc.) — visual and interaction updates.
- Add small local SVG/CSS assets only where needed for requested icons/bonuses/fallbacks.

## Validation

Before considering the work complete:

- Build must succeed with the existing Vite build command.
- Main game path must work end-to-end: lock -> home -> intro 8.3s -> 3/2/1 -> 30s direct-tap game -> results -> optional replay -> lock after max two games.
- Bonus behavior must be deterministic: 5G `+10`, network `x2`.
- No `/35`, target-minimum or attempt-number copy remains in the playable UI.
- Safari and Messages appear only in the dock, not the grid.
- Both home screens share the same requested app set.
- Video call path must work end-to-end: lock -> home -> full-screen incoming state -> slide to answer -> video/question branch -> ended -> reset.
- Final video-call screen contains no `Grazie!`.
