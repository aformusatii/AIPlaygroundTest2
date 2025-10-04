# 🧾 Prompt for Codex

**Generate a Complete Web App Using Vue 3 + Express + Level (PWA, Bootstrap 5, REST) to Manage Secrets, Keys & Credentials with Workspaces**

---

## 🧠 Role & Style

You are an expert full-stack engineer. Produce a **complete, runnable** project using the exact stack and rules below. **No placeholders, no ellipses.** Include **every referenced file** in full. Use **clear comments** only where helpful.

---

## 📦 Tech & Versions (Lock These)

* Node.js: **latest LTS**
* Package manager: **npm**
* Module format: **ESM** across backend and frontend
* Frontend: **Vue 3**, **Vite**, **Vue Router: yes**, **Pinia: yes**
* Styling: **Bootstrap 5** (imported in `index.html` or `main.ts`), **Google Fonts: Inter (400/500/600)**, **Lucide** icons
* Backend: **Express** (ESM), **helmet**, **cors**, **morgan** (logging), **Level** (JSON), **Axios** (for outbound calls if needed)
* Validation: **zod**
* Testing: **Vitest** + **Supertest** for API; **Vitest** for components
* Lint/Format: **ESLint** + **Prettier**
* PWA: **Workbox** service worker + **manifest.webmanifest** (installable)
* File uploads: **multer**, with static serving of uploaded files

---

## 🧭 Functional Requirements

### Core Objective

Build a personal **secrets manager** that supports multiple secret types and **workspaces**. No authentication (handled externally by reverse proxy). UX should favor **fast search**, **dense table views**, and **copy-to-clipboard without revealing** secret values on screen.

### Supported Secret Types (with separate menu items)

1. **Secrets (App/Website Credentials)**

   * Fields: name, username, password, otpMethod (e.g., TOTP/SMS/Email/NONE), url, notes, iconUrl, tags[]
2. **API Keys**

   * Fields: name, provider, apiKey (masked), baseUrl, scopes[], environment (dev/stage/prod), notes, iconUrl, tags[]
3. **SSH Keys (RSA key pair)**

   * Fields: name, publicKey, privateKey (masked), comment, notes, iconUrl, tags[]
4. **Bank Cards**

   * Fields: cardholderName, brand (Visa/Mastercard/etc.), cardNumber (masked), expiryMonth, expiryYear, cvv (masked), billingAddress, notes, iconUrl, tags[]
5. **Bank Accounts**

   * Fields: bankName, accountHolder, accountNumber (masked), iban, swiftBic, routingNumber, currency, notes, iconUrl, tags[]

### Workspaces

* Entities: **Workspaces** with fields `{ id, name, description?, createdAt, updatedAt }`
* Every secret/key entity must belong to exactly **one workspace** via `workspaceId`.
* Provide a **workspace switcher** in the UI header (dropdown) to filter all lists/searches.

### Searching & Listing

* **Global search input** on each list page (`q` filters by name/notes/selected fields).
* **Table view** with dense rows to accommodate many items on a single page.
* Columns: name, workspace, key fields (masked where sensitive), tags, updatedAt, actions.
* **Copy-to-clipboard buttons** for any sensitive field (copy the actual value without revealing it on screen).

  * Show a brief toast/toaster “Copied” confirmation.
  * Never render the actual value in the DOM when masked (avoid accidental reveal).
* Sorting (`?sort=createdAt,-name`) and pagination (`page`, `limit`).

### Icons

* Allow **uploading an icon** per record (PNG/JPG/SVG).
* Backend exposes `POST /api/v1/uploads` using `multer`, stores files in `backend/public/uploads/`, serves static URLs from `/uploads/...`.
* Each resource supports `iconUrl` field that stores the served file URL.

### Navigation (Left Sidebar)

* **Secrets** (App/Website Credentials)
* **API Keys**
* **SSH Keys**
* **Bank & Cards** (submenu with **Bank Cards** and **Bank Accounts**)
* **Workspaces** (manage list of workspaces)

### Non-Goals / Out of Scope

* **Authentication/authorization** (handled upstream)
* Cloud KMS/integrations (local-only)
* End-to-end encryption (optional note below; not required)

---

## 🗂️ Architecture & Project Layout

Create a monorepo-style root with `frontend/` and `backend/`.

```
.
├─ README.md
├─ .gitignore
├─ .env.example
├─ package.json                 # root scripts to run both dev servers concurrently
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ package.json
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ app.css
│  │  ├─ App.vue
│  │  ├─ router/index.ts
│  │  ├─ stores/index.ts
│  │  ├─ components/
│  │  │  ├─ DataTable.vue
│  │  │  ├─ CopyButton.vue
│  │  │  ├─ IconUploader.vue
│  │  │  ├─ WorkspaceSwitcher.vue
│  │  │  └─ SearchBar.vue
│  │  ├─ pages/
│  │  │  ├─ SecretsList.vue
│  │  │  ├─ ApiKeysList.vue
│  │  │  ├─ SshKeysList.vue
│  │  │  ├─ BankCardsList.vue
│  │  │  ├─ BankAccountsList.vue
│  │  │  └─ WorkspacesList.vue
│  │  ├─ services/http.ts      # Axios client, baseURL from env/proxy
│  │  ├─ services/toast.ts
│  │  └─ pwa/
│  │     ├─ registerSW.ts
│  │     └─ sw.ts              # Workbox build inject
│  ├─ public/
│  │  ├─ manifest.webmanifest
│  │  └─ icons/*               # PWA icons
└─ backend/
   ├─ package.json
   ├─ public/
   │  └─ uploads/              # uploaded icons served statically
   ├─ src/
   │  ├─ server.ts
   │  ├─ config/env.ts
   │  ├─ db/index.ts           # Level setup
   │  ├─ utils/crypto.ts       # masking helpers only (not encryption)
   │  ├─ middlewares/
   │  │  ├─ error.ts
   │  │  └─ notFound.ts
   │  ├─ routes/
   │  │  └─ v1/
   │  │     ├─ index.ts
   │  │     ├─ uploads.ts
   │  │     ├─ workspaces.ts
   │  │     ├─ secrets.ts
   │  │     ├─ apiKeys.ts
   │  │     ├─ sshKeys.ts
   │  │     ├─ bankCards.ts
   │  │     └─ bankAccounts.ts
   │  ├─ controllers/
   │  │  ├─ workspaces.ts
   │  │  ├─ secrets.ts
   │  │  ├─ apiKeys.ts
   │  │  ├─ sshKeys.ts
   │  │  ├─ bankCards.ts
   │  │  └─ bankAccounts.ts
   │  ├─ services/
   │  │  ├─ repo.ts            # generic CRUD with Level
   │  │  └─ search.ts          # text filtering & sorting
   │  └─ validation/
   │     ├─ common.ts
   │     ├─ secrets.ts
   │     ├─ apiKeys.ts
   │     ├─ sshKeys.ts
   │     ├─ bankCards.ts
   │     └─ bankAccounts.ts
   ├─ tests/
   │  └─ api.spec.ts
   └─ openapi/
      └─ openapi.yaml          # minimal schema for swagger-ui-express
```

---

## 🔒 Environment & Config

* Root `.env.example`:

  * `NODE_ENV=development`
  * `PORT=3000`
  * `API_PREFIX=/api/v1`
  * `LEVEL_PATH=./data`
  * `FRONTEND_URL=http://localhost:5173`
  * `BACKEND_URL=http://localhost:3000`
  * `MAX_UPLOAD_SIZE_MB=5`
* Do **not** commit `.env`.

---

## 🔗 REST API Conventions

* Base path: `/api/v1`
* Resource naming: **plural nouns**
* Endpoints (CRUD):

  * `GET /{resource}` with `q`, `page`, `limit`, `sort`
  * `GET /{resource}/:id`
  * `POST /{resource}`
  * `PATCH /{resource}/:id`
  * `DELETE /{resource}/:id`
* Filter **all list endpoints** by `workspaceId` (required for create; optional for list; if omitted, returns all).
* Response envelope:
  `{ data, meta, error }`
* Error format (RFC 7807-like):

  ```json
  {
    "type": "about:blank",
    "title": "Bad Request",
    "status": 400,
    "detail": "Validation failed",
    "errors": [{ "path": "name", "message": "Required" }]
  }
  ```
* Validation with **zod** on all input payloads.

---

## 🗃️ Persistence (Level)

* Use `level` with `valueEncoding: 'json'`.
* Database path from `LEVEL_PATH`.
* Key schema: `resource:{id}` (e.g., `secrets:42`).
* Implement generic repo with helpers:

  * `list({ q, sort, page, limit, workspaceId })`
  * `get(id)`
  * `create(data)` (assign `id`, timestamps)
  * `update(id, partial)` (update `updatedAt`)
  * `remove(id)`
* Ensure **atomic-like** operations via Level batch where relevant.

---

## 🌐 CORS & Networking

* Enable CORS for `FRONTEND_URL`.
* Frontend Axios base URL: `import.meta.env.VITE_API_BASE_URL || '/api/v1'` (use Vite dev proxy to backend).
* Serve `/uploads` statically from `backend/public/uploads`.

---

## 📱 PWA Requirements

* `manifest.webmanifest`: name **“Secretarium”**, short_name “Secretarium”, description, theme_color, background_color, display `standalone`, icons (192/512).
* **Service Worker** via Workbox:

  * Precache app shell (HTML/CSS/JS).
  * Runtime cache: API requests (stale-while-revalidate), Google Fonts (cache-first), images/icons (cache-first).
  * Offline fallback page.
* Install prompt UX: show install button if `beforeinstallprompt` available.

---

## 🧩 UI/UX & Styling

* **Layout:** left sidebar nav (Lucide icons), header with workspace switcher + search, main content area with tables.
* **Tables:** Bootstrap table with sticky header, compact spacing, responsive overflow on small screens.
* **Masking:** render masked placeholders (e.g., `••••••••`) for sensitive fields; never hydrate actual values into the DOM for masked cells.
* **Copy buttons:** adjacent to masked fields; use `navigator.clipboard.writeText` from data fetched via **on-demand API call** to avoid exposing secret in page state.
* **Modals/Forms:** create/edit forms per type; icon uploader component integrated with uploads endpoint.
* **Accessibility:** form labels, keyboard nav, focus rings, aria-live for toasts.

---

## 🧪 Testing

* **Backend**: Vitest + Supertest API tests for each resource covering create, list (q, pagination, workspace filter), get, update, delete, and error paths.
* **Frontend**: Vitest component tests for `CopyButton`, `DataTable`, and one list page.
* Lint & format scripts included.

---

## 📘 Documentation

* `README.md` with:

  * Prereqs, install, run (dev & prod), test, build steps
  * API docs route (`/api/docs`) using swagger-ui-express for `openapi.yaml`
  * PWA install instructions & troubleshooting
  * Notes on **security posture** (masking, no auth by design, reverse proxy expected)

---

## 🧩 Data Models (zod, DTOs)

### Common

* `Base`: `{ id: string, workspaceId: string, name: string, tags?: string[], iconUrl?: string, createdAt: string, updatedAt: string, notes?: string }`

### Secrets (App/Website Credentials)

* `username: string`
* `password: string` (**sensitive**)
* `otpMethod: 'TOTP' | 'SMS' | 'EMAIL' | 'NONE'`
* `url?: string`

### API Keys

* `provider: string`
* `apiKey: string` (**sensitive**)
* `baseUrl?: string`
* `scopes?: string[]`
* `environment?: 'dev' | 'stage' | 'prod'`

### SSH Keys

* `publicKey: string`
* `privateKey: string` (**sensitive**)
* `comment?: string`

### Bank Cards

* `cardholderName: string`
* `brand: string`
* `cardNumber: string` (**sensitive**)
* `expiryMonth: number (1-12)`
* `expiryYear: number (>= current year)`
* `cvv: string` (**sensitive**)
* `billingAddress?: string`

### Bank Accounts

* `bankName: string`
* `accountHolder: string`
* `accountNumber: string` (**sensitive**)
* `iban?: string`
* `swiftBic?: string`
* `routingNumber?: string`
* `currency?: string`

> **Masking Rule:** For all `**sensitive**` fields, list views show masked content; detail view omits actual values by default. Provide dedicated `POST /{resource}/:id/secret/{field}/copy` endpoints to return the value once for clipboard copy (response should not be cached and never logged). Frontend never stores these values in component state after copying.

---

## 🔧 Endpoints Summary

* Workspaces: `/api/v1/workspaces`
* Secrets (credentials): `/api/v1/secrets`
* API Keys: `/api/v1/api-keys`
* SSH Keys: `/api/v1/ssh-keys`
* Bank Cards: `/api/v1/bank-cards`
* Bank Accounts: `/api/v1/bank-accounts`
* Uploads: `POST /api/v1/uploads` (returns `{ url }`)
* Copy helpers (examples):

  * `POST /api/v1/secrets/:id/secret/password/copy`
  * `POST /api/v1/api-keys/:id/secret/apiKey/copy`
  * `POST /api/v1/ssh-keys/:id/secret/privateKey/copy`
  * `POST /api/v1/bank-cards/:id/secret/cvv/copy`
  * `POST /api/v1/bank-accounts/:id/secret/accountNumber/copy`

*Copy endpoints return `{ success: true }` after setting clipboard via frontend call to read response text; alternatively return `{ value: "<string>" }` and immediately overwrite variable after copy.*

---

## ✅ Acceptance Criteria

1. **App runs** with `npm install` at root, then `npm run dev` (starts both frontend and backend).
2. **PWA** installs on a mobile device and passes Lighthouse PWA baseline.
3. **CRUD** works for all resources with Level persistence and workspace filtering.
4. **Search, sort, pagination** work on all list endpoints and in UI tables.
5. **Copy-to-clipboard** works without revealing secret values on screen; requests are per-field and ephemeral.
6. **Icons** can be uploaded and are displayed in tables and detail views.
7. **REST conventions** (plural nouns, verbs, pagination, filter, sort) and **standard error shape** are followed.
8. **ESLint/Prettier** pass; **tests** pass.
9. No missing files, no TODOs, no `...`.

---

## 📤 Output Format Rules (Critical)

1. Start with a brief description of the app and architecture (3–6 lines).
2. Show **one directory tree** (as above structure).
3. Provide **every file** as a separate fenced code block:

   * Precede each with a comment line `// path: <filepath>`
   * Then the full file content in a fenced code block.
4. Use correct extensions (`.ts` preferred where applicable).
5. Include code for configs, scripts, tests, service worker, and upload handling.
6. Do not reference files that aren’t included.

---

## 🧾 Assumptions (state these in the README)

* No authentication (secured by external reverse proxy upstream).
* No at-rest encryption (local-dev convenience). Add a README note on how to layer external encryption or reverse-proxy secrets vaults later.
* Dev-only file uploads to local filesystem.
* Workspaces are mandatory for creation; UI defaults to the first/selected workspace.

---

## 🔧 Tooling & Scripts

* Root scripts:

  * `dev` (concurrently run Vite + nodemon)
  * `build` (build frontend and backend)
  * `lint`, `format`, `test`
* Vite dev server proxy: `/api` → backend `PORT`.
* Swagger UI at `/api/docs` serving `openapi.yaml`.

---

## 🧪 Seed Data (optional but include if small)

* Provide a tiny seed script or endpoint that creates:

  * Workspaces: **Work Endava**, **Work MC**, **Personal**, **Homelab**
  * 1–2 example records for each resource (with realistic but fake data)

---

## 🚀 Deliverables

* Full codebase (all files) as code blocks.
* Instructions to run dev mode and production build.
* Post-generation checklist verifying Acceptance Criteria.

---

## 📝 App Name & UX Copy

* App Name: **Secretarium**
* Tagline: “Fast, searchable, workspace-scoped secrets & keys.”
* Primary actions: **New**, **Upload Icon**, **Search**, **Copy**

---

**Now generate the complete repository per the rules above.**
