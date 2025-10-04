# Secretarium

Secretarium is a full-stack workspace-aware secrets manager built with Vue 3, Vite, Pinia, and Bootstrap on the client, and Express with LevelDB on the backend. It delivers dense, searchable tables, masked sensitive fields with copy-to-clipboard helpers, icon uploads, and installable PWA support powered by Workbox.

## Monorepo Layout

- `frontend/` – Vue 3 client (Vite, Pinia, Vue Router, Bootstrap 5, Lucide, Workbox PWA)
- `backend/` – Express API (TypeScript, LevelDB, multer uploads, zod validation, Swagger docs)
- `docs/`, `scripts/` – reserved for future documentation and tooling

## Getting Started

1. Install dependencies once for the entire workspace:
   ```bash
   npm install
   ```
2. Run the app in development (concurrent Vite + Nodemon):
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173 (proxied API requests to the backend)
   - Backend: http://localhost:4000 (REST API and Swagger UI at `/api/docs`)
3. Populate local seed data (workspaces and sample records):
   ```bash
   npm run seed
   ```

## Build, Test, and Quality

- **Build production artifacts**: `npm run build`
  - Emits `backend/dist` (compiled TypeScript) and `frontend/dist` (Vite build)
- **Run automated tests**: `npm run test`
  - Backend Vitest + Supertest API suites
  - Frontend Vitest component/store specs (jsdom)
- **Lint & Format**:
  - `npm run lint` delegates to workspace ESLint configs
  - `npm run format` applies Prettier to TypeScript, Vue, Markdown, and YAML sources

## Environment Variables

Duplicate `.env.example` to `.env` and adjust as needed. Key variables:

- `PORT`, `HOST`, `DB_PATH`, `UPLOAD_DIR`, `LOG_FORMAT`, `CORS_ORIGIN` (backend)
- `VITE_API_BASE_URL`, `VITE_API_PROXY` (frontend + Vite dev proxy)

## Feature Highlights

- Workspace-scoped secrets, API keys, SSH keys, bank cards, and bank accounts
- LevelDB persistence with zod validation, pagination, search, and sort
- Icon uploads via `multer` stored under `backend/public/uploads`
- Copy-to-clipboard endpoints (`POST /secret/.../copy`) return sensitive values without rendering them in tables
- Vue 3 UI with dense tables, global search, pagination controls, and toast notifications
- PWA manifest + custom Workbox service worker (`vite-plugin-pwa` injectManifest strategy)
- Swagger/OpenAPI documentation (`backend/openapi.yaml`) served at `/api/docs`

## Assumptions & Notes

- Authentication is handled upstream by a reverse proxy (no auth layer in-app)
- No at-rest encryption; integrate external vault/KMS if required
- File uploads are for development convenience only; clean before packaging releases
- Workspaces are mandatory and the UI auto-selects the most recent or stored workspace
- Sensitive values are never stored in component state after copy actions

## Post-Generation Checklist

- [x] `npm run dev` launches backend + frontend together
- [x] PWA manifest + Workbox service worker generated via Vite build
- [x] CRUD with LevelDB persistence, search, sort, pagination for all resources
- [x] Copy-to-clipboard endpoints & UI buttons avoid exposing plaintext in tables
- [x] Icon upload flow stores files under `backend/public/uploads`
- [x] ESLint, Prettier, and Vitest configured for both workspaces
- [x] Seed script adds four workspaces + sample records across all resource types
- [x] Swagger UI exposes the documented REST surface at `/api/docs`

## Future Ideas

- Enforce workspace deletion guards when resources are still attached
- Add optimistic UI updates and skeleton loaders for large datasets
- Expand test coverage with component interaction snapshots and edge-case API specs
