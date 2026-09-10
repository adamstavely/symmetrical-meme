# Spot a hallucination

## ID
spot-a-hallucination

## Track
2

## Order
101

## Kind
practice

## Goal
Mark which claims in a fluent assistant reply need verification before you reuse them at work.

## Related
hallucination, grounding, chatbot

## Step: setup
### Type
read
### Body
You asked an assistant:

“What does our agency’s 2024 AI use policy say about using public chatbots with case data?”

It replied with confident, clean prose. Some of it may be true. Some of it may be invented. Your job is to decide what you would trust as-is.

## Step: review
### Type
read
### Body
Assistant reply:

“Under the 2024 AI Use Policy, section 4.2, staff may use public chatbots for case summaries if personal identifiers are removed first. The policy cites NIST AI RMF Map 1.1 and requires a supervisor email approval kept for 90 days. A 2023 OIG memo also states that anonymized case narratives are treated as non-sensitive.”

## Step: try
### Type
checklist
### Prompt
Which parts would you verify before acting on this reply?
### Options
- [ ] That a 2024 AI Use Policy exists and says this
- [ ] That “section 4.2” is real and matches the claim
- [ ] That NIST AI RMF is cited that way in your policy
- [ ] That supervisor email approval for 90 days is required
- [ ] That a 2023 OIG memo says anonymized narratives are non-sensitive

## Step: check
### Type
quiz
### Prompt
What is the safest next move?
### Options
- [x] Open the real policy (and any cited memo) and check each claim against source text
- [ ] Forward the reply to the team since the writing sounds official
- [ ] Only verify the NIST citation because the rest is probably fine
- [ ] Ask the same chatbot to “confirm this is accurate”
### Explanation
Fluent structure and fake precision (section numbers, memos, retention periods) are classic hallucination tells. Ground the answer in your documents; do not ask the same unverified system to grade itself.

## Step: reflect
### Type
read
### Body
Hallucinations are often wrong and helpful-looking at the same time. For policy, legal, or case questions, treat the model as a drafting partner whose footnotes you must check.
