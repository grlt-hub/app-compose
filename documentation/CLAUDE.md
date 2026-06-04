# CLAUDE.md

This file provides context for AI assistants working on the documentation site. It extends the root `CLAUDE.md`.

## Language and register

- Write for B1–B2 ESL developers. No idioms, no literary turns, no abstract metaphors.
- Say "context", not "dependencies", in user-facing copy. Internal code may say "dependencies".
- `Scope`, `Context`, and `Spot` are public type names — never use them as casual nouns in prose; it creates a false anchor to the type.
- Do not use a term (e.g. "Task", "Wire") in copy that renders above the section where the term is introduced. Reference pages are the exception: reader maturity is assumed there.

## Genres: guides vs reference

- Guides and reference are different genres. Parameter signatures do not belong in guide prose — the sandbox shows the shape, prose says what fires.
- Reference favors completeness over compression: enumerate fully, don't group sources or usages into categories — readers want a definitive picture.
- Add a sandbox to a reference page only when the symbol is not already demoed in quick-start or guides; the lookup card is the default.
- Open a guide with a concrete fact about library mechanics in the target context — never with universal wisdom about modularity or testability.
- No style-choice justifications: drop "we use X so Y; Z works too" notes. The reader didn't ask.
- When a guide holds an artifact's name for an end reveal, the intro and bridge must describe the activity without naming the term.
- When two guides converge on the same rule, lift it verbatim as a chorus — don't coin a parallel formulation.
