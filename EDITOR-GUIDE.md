# Updating Interchange

Open any `.md` file in a text editor. Change the words beneath a heading, save, then restart the local app and refresh its page. If you use GitHub's file editor, pull those edits onto this computer before restarting.

## The format

The first line is `# Title`. Each field starts with `## Field name`. Keep field names exactly as shown in the templates. Blank lines between sections make them easy to read. Long definitions and explanations can span paragraphs. Text is displayed as plain text: embedded HTML and extra Markdown formatting are not interpreted. This intentionally avoids HTML editing or executable content.

## Edit a lesson or flashcard

Open a file in `content/terms/`. The title is the flashcard front; Definition is the answer. Usage is its example sentence. Local note is optional team-specific guidance. Related is a comma-separated list of other term IDs and can be empty.

To add a term, copy `templates/term.md` into `content/terms/` and give it a unique filename and ID. Use lowercase words joined by hyphens for IDs. Journey is the numbered line (1–5); Order determines its position on that line and must be unique within the line. Keep at least two terms per line. Add a corresponding question using the question template so the term works in review drills.

Keep IDs unchanged when renaming a term. Before deleting a term, remove its questions and remove its ID from other terms' Related sections. Learners' old marks for removed terms do not count toward current progress.

## Edit a question

Copy `templates/question.md` into `content/questions/`. Set Term to an existing term ID. Use `quiz`, `exam`, or `quiz, exam` to choose where the question appears. Journey checkpoints and missed-term drills use quiz questions; the final and practice exams use exam questions.

Write 2–5 choices, one per line. Mark exactly one correct answer with `[x]`; mark every other answer with `[ ]`. The app shuffles choices, so do not reference answer letters or write “all of the above.” Explanation appears after an answer. Write it to explain why the answer is correct.

The initial 81 questions were migrated from the existing term definitions. Edit them to add scenarios or more challenging distinctions. You may add several questions for one term using different question IDs.

## Edit journeys and the exam

Journey files control names, the question that introduces the journey, descriptions, colors and checkpoint lengths. Quiz length cannot exceed the number of available quiz questions for that line. Colors use six-digit hex values such as `#1338b0`. Keep IDs 1–5 because the original map has five line paths.

In `content/exam.md`, Question count is the number sampled from questions marked for exam use. Pass percentage controls the passing result and badge threshold. The count cannot exceed the available exam bank. In `content/course.md`, update the featured course title and description.

## Check your changes

Restart using `npm start`, or run `npm run build`. Validation reports the file or ID and the problem: missing sections, duplicate IDs, broken references, invalid choices, or too few questions. Fix the reported issue and try again. Do not edit `dist/content.js`: it is regenerated.

Content files are the authoritative source. The catalog and `terms.js` in `original/` remain historical references and editing them will not change the app.
