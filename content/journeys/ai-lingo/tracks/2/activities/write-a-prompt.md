# Write a useful prompt

## ID
write-a-prompt

## Track
2

## Order
100

## Kind
tutorial

## Goal
Draft a prompt that asks an assistant for a short work brief with a clear audience, format, and constraints.

## Related
prompt, prompt-eng, system-prompt, context-eng

## Local note
Use a real briefing your team would actually request.

## Step: setup
### Type
read
### Body
You need a one-page brief for a manager who has five minutes before a meeting. The topic is whether the team should trial an AI writing assistant for status reports.

Your job is not to decide yes or no yet. Your job is to ask the model for a useful brief.

## Step: try
### Type
prompt
### Prompt
Write the prompt you would paste into the assistant.
### Hint
Name the audience, length, what decision the brief should support, and what to leave out.
### Example
Write a one-page brief for a busy operations manager deciding whether to pilot an AI writing assistant for weekly status reports. Cover likely benefits, risks, and a 2-week trial plan. Do not recommend a vendor. Use plain language and bullet points where helpful.

## Step: check
### Type
checklist
### Prompt
Does your prompt include each of these?
### Options
- [ ] Who the brief is for
- [ ] Length or format
- [ ] The decision it should support
- [ ] At least one constraint (tone, out-of-scope, no vendor pick, etc.)

## Step: reflect
### Type
read
### Body
A weak prompt sounds like: “Tell me about AI for status reports.”

A stronger prompt names the reader, the deliverable, and the edges. That is prompt engineering in practice: you are designing the request, not hoping the model guesses the assignment.
