# Crucible learning app

A local, static learning app built around the original Interchange HTML design. Includes the transit map, sequential learning, flashcards, flags and review drills, journey checkpoints, a final exam, a searchable printable glossary, and progress saved in this browser.

## Run locally

Install Node.js 20 or newer, then in this folder:

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Stop with Ctrl+C. After editing Markdown, stop and restart to validate and rebuild. Refresh the page to see the changes. `npm run build` rebuilds without starting a server; `npm test` checks content and learning logic. Nothing is published by these commands.

## Edit the learning material

Read [EDITOR-GUIDE.md](EDITOR-GUIDE.md). All live learning content is in `content/journeys/`. Templates are in `templates/`. The JavaScript and HTML do not need changes for ordinary content edits.

Each journey is a folder (today: `content/journeys/ai-lingo/`):

- `journey.md`: journey title, id and description.
- `tracks/<n>/metadata.md`: line name, quiz length, and other track metadata.
- `tracks/<n>/knowledge-check.md`: end-of-track and drill questions for that track.
- `tracks/<n>/terms/`: lesson text, flashcard front/back, examples and related terms for that track.
- `tracks/<n>/activities/`: optional practice activities for that track.
- `exam/metadata.md`: exam title, description, question count and passing score.
- `exam/questions.md`: the full final/practice exam bank.

Add another journey by creating a sibling folder under `content/journeys/`. The runtime currently loads one active journey (AI Lingo when present).

## Implementation

The build validates a deliberately small Markdown format and generates `dist/content.js`. The existing DC runtime and visual template render that data using locally served React 18.3.1 assets. No database, account, API key, external AI service, or server framework is required. Google Fonts is optional; system fonts work without it. The runtime is retained unchanged because its source is not included.

`index.html` is the working app. `original/AI Lingo.dc.html`, `original/terms.js`, and `original/ai-lingo-catalog.md` are preserved original references and are not live content sources. `original/support.js` is the original generated runtime, retained as supplied. `dist/` is generated and ignored by Git. The current map supports up to five numbered tracks per journey; adding more requires a layout change. Content can be added freely within those tracks. Multiple journey folders are validated; switching between them in the UI is not wired yet.

The exam unlocks when every term is marked learned. Practice is available earlier and never awards a badge or records a final exam score. Passing a completed final exam awards a badge. Each attempt samples the Markdown question bank. These are self-study checks, not secure certification exams: answers ship with the static app.

Progress is local to this browser and origin, not synchronized. Keep term IDs stable to preserve progress; clearing browser data removes it. Existing original-app progress uses the same storage key. Running the app does not deploy it.

All four files from the initial checkout are preserved byte-for-byte in `original/`. The build copies its runtime to the generated app.

## Accessibility validation status

The app includes keyboard controls, focus handling, main landmarks, headings, feedback announcements, readable text sizing and responsive layout fixes. Seven automated logic/content tests pass. WCAG 2.2 AA and viewport testing are in progress; this checkpoint does not claim full conformance. Local-only axe controls are available at `http://127.0.0.1:4173/?audit`. They are not included in the static build.
