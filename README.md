# Sky Mobile — Interactive Experiences

React/Vite prototype for the two vertical touch experiences described in the event PRD.

## Routes

- `/game` — Sky Mobile SIM Catch
- `/videocall` — simulated branching video call

## Unlock codes

- SIM Catch: `9,90`
- Video Call: `4567` (temporary until the client confirms the final code)

## Run

```bash
npm install
npm run dev
```

## SIM Catch flow

`LOCKED → HOME → INTRO → 5s COUNTDOWN → 59s GAMEPLAY → RESULTS → 5s RESET → LOCKED`

The game is touch-only. Move the catcher horizontally with a finger. Each SIM is worth 10 points. There are no penalties, records or leaderboards.

## Video Call flow

`LOCKED → HOME → INCOMING CALL → ANSWER → INTRO VIDEO + SELF VIEW → QUESTION → CORRECT/WRONG VIDEO → END → 5s RESET → LOCKED`

The webcam is used only as a live self-view and is never recorded or uploaded. Camera access requires HTTPS (Vercel is suitable) or localhost.

## Video assets

Put the final MP4 files at these paths:

```text
public/
  media/
    talent-a/
      intro.mp4
      correct.mp4
      wrong.mp4
    talent-b/
      intro.mp4
      correct.mp4
      wrong.mp4
```

The `intro.mp4` file should end exactly where the interactive question must appear. The final clips should begin from that same conversational beat so the switch feels continuous.

Until the files are supplied, the app intentionally shows a visual fallback and still lets QA test the complete branching flow.

## Content still to replace

The PRD intentionally leaves some content TBD. Search in `src/components/VideoCallExperience.jsx` for `QUESTIONS` and replace the placeholder questions/answers when the client provides final copy. The second talent is currently named `Talent 2` until the definitive name is supplied.

In `src/components/GameExperience.jsx`, replace the two-word placeholder in `Con Sky Mobile hai _____ _____.` when final copy arrives.

## Deployment

The repository includes `vercel.json` so React Router deep links such as `/game` and `/videocall` resolve correctly on Vercel.
