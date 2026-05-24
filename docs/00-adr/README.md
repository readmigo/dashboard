---
title: ADR index
phase: adr
status: active
owner: data-team
last_updated: 2026-05-24
---

# ADR index

This directory stores Architecture Decision Records for the Readmigo Dashboard in [Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). One ADR per file, named `NNNN-{title}.md` with sequential numbering.

## ADR list

No ADRs yet. Create new ones with `pnpm new-adr --title="..."` (tool ships in a follow-up phase; manual creation works today).

Candidate ADRs for future documentation:

| # | Title | Status |
|---|---|---|
| 0001 | Use react-admin as the admin framework | pending |
| 0002 | Use PostHog HogQL for analytics queries | pending |
| 0003 | Use React Context API over Redux for state management | pending |
| 0004 | Adopt design token system via brandTokens.ts | pending |
| 0005 | Use Playwright for E2E testing without unit test framework | pending |

## Nygard template

Every ADR must contain:

- `## Status` (proposed / accepted / deprecated / superseded)
- `## Context`
- `## Decision`
- `## Consequences`
