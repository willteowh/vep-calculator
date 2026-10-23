# Agent notes

Vite + React + TypeScript single-page app (not Next.js). Fare rules live in `src/utils/calculations.ts` and `src/config/constants.ts`.

- Unit tests: `npm test` (Vitest). Cypress: `npm run e2e`.
- The hand-derived fare scenarios in `docs/fare-scenarios/` are the source of truth for the fare tests; after editing them run `npm run scenarios:sync`.
- Singapore time only; tests pin `TZ=Asia/Singapore`.
