# Agent notes

Vite + React + TypeScript single-page app (not Next.js). Fare rules live in `src/utils/calculations.ts` and `src/config/constants.ts`.

- Unit tests: `npm test` (Vitest). Cypress: `npm run e2e`.
- Fare E2E specs are generated from `docs/fare-scenarios/`; built-in cases in `src/config/testCases.ts` are an in-app self-help feature. Run `npm run scenarios:sync` after editing fare scenario data.
- Singapore time only; tests pin `TZ=Asia/Singapore`.
