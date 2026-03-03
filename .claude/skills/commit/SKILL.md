---
description: Generate commit message options based on repository rules
---

1. Run `git diff --cached` to analyze the staged changes.
2. Generate 3 distinct commit message options following these strict rules:
   - **Language**: American English.
   - **Format**: `<type>: <summary>`.
   - **Allowed Types**: added, changed, chore, deprecated, fixed, removed, reverted, security.
   - **Constraint**: The summary must NOT start with a verb.
   - **Constraint**: The summary must be 72 characters or less.
3. Present the options as a numbered list.
4. Ask me: "Which option should I use? (Enter a number or provide your own text)."
5. Once I select a number or provide text, execute: `git commit -m "[selected message]"`
6. After the commit succeeds, ask: "Push to remote? (Y/N)". If Y, run `git push`.
