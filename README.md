# XPOD

XPOD is a voice-first workout tracker for the gym. It captures sets from speech, logs your lifts, and gives simple progressive overload recommendations.

## Features

- Voice capture using the browser Speech Recognition API.
- Transcript parsing for exercise, weight, reps, and RPE.
- One-click set logging and local workout history.
- Automatic overload suggestions per exercise.
- Local-first storage with `localStorage`.

## Run

Because XPOD is dependency-free, you can run it by opening `index.html` in a browser.

For best voice support, use a Chromium-based browser.

## Voice format examples

- `Bench press 185 pounds 8 reps rpe 8`
- `Squat 225 lb 5 reps`
- `Deadlift 315 pounds 3 reps`

## Notes

- Data is stored only on your machine in the browser.
- Clearing browser storage will remove saved workout sets.
