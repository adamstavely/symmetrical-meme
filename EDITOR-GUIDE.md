# Updating Interchange

Open any `.md` file in a text editor. Change the words beneath a heading, save, then restart the local app and refresh its page. If you use GitHub's file editor, pull those edits onto this computer before restarting.

## The format

The first line is `# Title`. Each field starts with `## Field name`. Keep field names exactly as shown in the templates. Blank lines between sections make them easy to read. Long definitions and explanations can span paragraphs. Text is displayed as plain text: embedded HTML and extra Markdown formatting are not interpreted. This intentionally avoids HTML editing or executable content.

## Content layout

Each journey is a folder under `content/journeys/`:

```
content/journeys/<journey-id>/
  journey.md
  exam/
    metadata.md
    questions.md
  terms/
  tracks/
    1/
      metadata.md
      knowledge-check.md
    2/
      metadata.md
      knowledge-check.md
    …
```

AI Lingo lives at `content/journeys/ai-lingo/`. Add another journey by copying that folder structure (see `templates/`) and giving it a new id. The runtime currently boards one active journey (AI Lingo when present); hub support for switching journeys comes later.

## Edit a journey or track

Open `journey.md` for the featured title and description. Keep `## ID` identical to the folder name.

Each track is a numbered folder under `tracks/`. `metadata.md` sets the line name, driving question (`## Question`), description, color, and checkpoint length (`## Quiz length`). `## ID` must match the folder name (`tracks/1/` → `1`). Colors use six-digit hex values such as `#1338b0`.

`knowledge-check.md` holds every end-of-track / drill question as `## Question: id` blocks (see `templates/knowledge-check.md`). Quiz length cannot exceed the number of those blocks.

In `exam/metadata.md`, Question count is how many items are sampled from `exam/questions.md`. Pass percentage controls the passing result and badge threshold.

## Edit a lesson or flashcard

Open a file in that journey's `terms/` folder. The title is the flashcard front; Definition is the answer. Usage is its example sentence. Local note is optional team-specific guidance. Related is a comma-separated list of other term IDs and can be empty.

To add a term, copy `templates/term.md` into the journey's `terms/` folder and give it a unique filename and ID. Use lowercase words joined by hyphens for IDs. Track is the numbered line (1–5); Order determines its position on that line and must be unique within the track. Keep at least two terms per track. Add a matching `## Question: …` block in `tracks/<track>/knowledge-check.md` so the term works in review drills.

Keep IDs unchanged when renaming a term. Before deleting a term, remove its knowledge-check and exam question blocks and remove its ID from other terms' Related sections. Learners' old marks for removed terms do not count toward current progress.

## Edit knowledge-check and exam questions

Each question is a `## Question: id` block with `### Term`, `### Prompt`, `### Options`, and `### Explanation`. Use that shape in `tracks/<n>/knowledge-check.md` and in `exam/questions.md` (see `templates/exam-questions.md`). The same question id may appear in both when one prompt should serve track checks and the final exam.

Write 2–5 choices, one per line. Mark exactly one correct answer with `[x]`; mark every other answer with `[ ]`. The app shuffles choices, so do not reference answer letters or write “all of the above.” Explanation appears after an answer.

Every term needs at least one knowledge-check question on its track. Track quiz length cannot exceed that track's knowledge-check count; exam question count cannot exceed the exam bank size.

## Check your changes

Restart using `npm start`, or run `npm run build`. Validation reports the file or ID and the problem: missing sections, duplicate IDs, broken references, invalid choices, or too few questions. Fix the reported issue and try again. Do not edit `dist/content.js`: it is regenerated.

Content files are the authoritative source. The catalog and `terms.js` in `original/` remain historical references and editing them will not change the app.
