# Decide when to escalate

## ID
decide-when-to-escalate

## Track
5

## Order
100

## Kind
scenario

## Goal
Choose when an AI-assisted workflow can stay with the analyst versus when a human review gate is required.

## Related
hitl, governance, guardrails, aup, pii

## Step: setup
### Type
read
### Body
Your team uses an assistant to draft customer-response emails. Three requests land in the same hour. For each one, decide: handle with normal AI-assisted drafting, or escalate for human-in-the-loop review before anything is sent.

## Step: case-a
### Type
quiz
### Prompt
Case A: A customer asks for a copy of the public FAQ on password resets. The draft reply restates the FAQ and adds a help-desk link.
### Options
- [x] Normal AI-assisted drafting is fine, with a quick human skim if that is your team norm
- [ ] Require formal HITL escalation before send
- [ ] Refuse to use AI at all for any customer email
### Explanation
Low-risk, public information, no personal data. Standard review habits still apply; this is not a special escalation.

## Step: case-b
### Type
quiz
### Prompt
Case B: A customer asks why their claim was denied. The model drafts a reply that invents a denial reason and quotes a policy section you do not recognize.
### Options
- [ ] Send after fixing the tone
- [x] Escalate: a human must verify the denial reason against the case file and real policy
- [ ] Ask the model to regenerate until the section number looks familiar
### Explanation
Case-specific outcomes and unknown citations are high-harm if wrong. HITL means a person confirms the facts before the customer sees them.

## Step: case-c
### Type
quiz
### Prompt
Case C: The draft includes the customer’s full claim number, date of birth, and medical condition in the email body because those details were in the ticket.
### Options
- [ ] Send if the facts look right
- [ ] Remove the medical condition but keep DOB for “verification”
- [x] Escalate / stop: minimize PII, follow privacy rules, and have a human confirm what may be sent
### Explanation
PII and sensitive attributes change the risk class. Guardrails and governance here are about data handling, not writing quality.

## Step: reflect
### Type
read
### Body
Escalation is not a failure of the tool. It is how human-in-the-loop work stays accountable: AI can draft; people own decisions that affect customers, rights, or sensitive data.
