---
inclusion: always
---

# Keep documentation in sync with the code

Whenever you make a change that affects how the project works, update the
relevant documentation in the same turn — do not leave docs stale.

## When this rule applies

Update docs if a change does any of the following:

- Adds, removes, or renames a **feature** or a **page/route**.
- Adds, changes, or removes a **server API endpoint**.
- Changes the **architecture** (new app/package, provider, data source, auth model).
- Adds or changes a **dependency**, **environment variable**, or **run/build script**.
- Changes **setup, configuration, or deployment** steps.
- Changes user-facing behavior worth noting (new disclaimers, limitations, caveats).

## Which files to update

- **`README.md`** (root) — the source of truth. Keep these sections accurate:
  - Highlights / Features list
  - Monorepo structure
  - Provider / data-source description
  - API endpoint table
  - Tech stack
  - Getting started (scripts + env vars)
  - Roadmap (move shipped items out of it)
  - Disclaimer
- **`apps/*/.env.example`** — add any new environment variable with a comment.
- **SEO assets** (`apps/web/index.html`, `public/sitemap.xml`, `public/robots.txt`)
  — if a new **public** (non-auth) route is added, add it to the sitemap and
  reconsider robots rules. Update meta description/keywords if the product
  pitch changes.
- Any feature-specific docs or steering files that reference the changed area.

## How to do it

1. Make the code change.
2. Immediately reflect it in `README.md` and any other affected doc above.
3. Keep the README's wording factual and honest about limitations (e.g. mock
   auth, delayed market data, simplified datasets). Do not overstate.
4. Verify docs still match reality — endpoint paths, script names, and env var
   names must be exact.

Treat out-of-date documentation as a bug: if you touch the code and the docs no
longer match, fix the docs before considering the task done.
