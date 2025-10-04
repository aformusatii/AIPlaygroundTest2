# Repository Guidelines

## Project Structure & Module Organization
Secretarium is organised as a two-tier workspace. The root packages manage shared tooling, while `frontend/` holds the Vue 3 + Vite client (Pinia stores in `frontend/src/stores`, routes in `frontend/src/router`) and `backend/` hosts the Express + Level API (`backend/src/routes/v1` for REST handlers, `backend/src/services` for data access). Static assets live under `frontend/public` and `backend/public/uploads`. Shared documentation and scripts belong in `docs/` and `scripts/`. Keep seed data under `backend/src/seed` so it can be invoked without touching production paths.

## Build, Test, and Development Commands
Run `npm install` once at the root to bootstrap workspaces, then:
- `npm run dev` - starts Vite and Nodemon concurrently with hot reload.
- `npm run build` - builds both frontend (Vite) and backend (tsc bundling) outputs.
- `npm run test` - executes Vitest suites across frontend and backend, including Supertest API checks.
- `npm run lint` / `npm run format` - enforce ESLint and Prettier respectively.
- `npm run seed` - loads baseline workspaces and sample records into Level for local smoke tests.

## Coding Style & Naming Conventions
Use modern ESM and TypeScript across the stack. Prefer PascalCase for Vue components, camelCase for variables/functions, and kebab-case for file paths (except Vue SFCs). Indentation is two spaces; avoid tabs. Format before committing; Prettier is the single source of truth. Keep Vue components focused: composition utilities in `frontend/src/composables`, reusable UI in `frontend/src/components`.

## Testing Guidelines
Vitest powers both unit and component tests. Name files with the `.spec.ts` suffix beside the unit under test (e.g., `CopyButton.spec.ts`). API suites live in `backend/tests`, using Supertest for request assertions. Aim to cover CRUD paths, validation errors, and masking logic. Run `npm run test -- --watch` during active development to catch regressions early.

## Commit & Pull Request Guidelines
History is a mix of prototypes, so adopt Conventional Commits (`feat:`, `fix:`, `docs:`) for clarity moving forward. Keep commits focused and runnable. PRs must include a concise summary, testing notes, and screenshots or cURL samples when UI or API changes occur. Link related issues or tickets in the description. Before requesting review, ensure lint, format, and test commands all pass locally.

## Security & Configuration Tips
Secrets never belong in Git. Use `.env` files mirroring `.env.example` and rely on the reverse proxy for authentication. Uploaded icons are for local development only; purge them before packaging releases. Review Level database paths before deploying to ensure data isolation between environments.
