<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public\branding\orate-logo-horizontal-reverse-4096.png">
  <source media="(prefers-color-scheme: light)" srcset="public\branding\orate-logo-horizontal-4096.png">
  <img alt="Description" src="public\branding\orate-logo-horizontal-4096.png">
</picture>   

Orate is a teacher facing builder for phoneme Wordle and Word Search
activities. It is intended for teachers and speech pathologists who want to
configure an activity, test the learner experience, and download one playable
HTML file for classroom use.

The downloaded activities are self-contained: their HTML, CSS, data, and plain
JavaScript are embedded in a single file that can run offline in a normal web
browser.

## Features

- Configurable Phoneme Wordle target, difficulty, and spelling hints.
- Seeded Word Search puzzles with difficulty-dependent grids and directions.
- Exact learner preview before download.
- Single-file offline HTML downloads.
- Blue Mist light and Deep Navy dark themes carried into previews/downloads.
- Comfortable and compact interface density preferences.
- Cookie persistence with immediate visual updates.
- Responsive direct navigation and an accessible compact hamburger menu.

## Technology

- Next.js 16 App Router and Route Handlers
- React 19
- TypeScript
- Tailwind CSS 4 and semantic CSS custom properties
- Prisma ORM 7 with PostgreSQL 18
- Zod request validation
- Vitest
- Docker and Docker Compose
- Browser DOM, iframe, Blob, and download APIs

Orate is a full-stack application. Validated Route Handlers expose JSON APIs,
Prisma maps application data, and PostgreSQL stores word lists, ordered
phonemes, and reusable activity configurations.

## Local development

Prerequisites:

- Git
- Node.js and npm compatible with Next.js 16
- Docker Desktop
- A modern browser

Clone the repository:

```powershell
git clone <repository-url>
cd orate-v1
```

Copy the example environment file if `.env` does not already exist:

```powershell
Copy-Item .env.example .env
```

Review the development credentials in `.env`, then start PostgreSQL:

```powershell
docker compose up --detach database
```

Install dependencies, generate the Prisma client, apply committed migrations,
and run the repeatable starter seed:

```powershell
npm ci
npm run db:generate -- --config prisma7.config.ts
npx --no-install prisma migrate deploy --config prisma7.config.ts
npx --no-install prisma db seed --config prisma7.config.ts
```

Start the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Another port may be
selected if port `3000` is already occupied.

## Full container deployment

Copy `.env.example` to `.env` and review its development-only credentials.
Do not overwrite an existing `.env` containing the credentials used to
initialize the current PostgreSQL volume.

Validate the resolved Compose configuration without printing it:

```powershell
docker compose config --quiet
```

Build and start the complete application:

```powershell
docker compose up --build --detach
```

Compose starts the services in this order:

1. PostgreSQL starts and passes its connection health check.
2. Prisma applies committed migrations.
3. The repeatable starter seed synchronizes starter content.
4. Orate starts and verifies its database through `/health`.

Inspect every service, including the completed one-shot jobs:

```powershell
docker compose ps --all
```

Expected states:

| Service | Expected state |
| --- | --- |
| `database` | Running and healthy |
| `migrate` | Exited successfully |
| `seed` | Exited successfully |
| `app` | Running and healthy |

Open:

- Application: [http://localhost:3000](http://localhost:3000)
- Health endpoint: [http://localhost:3000/health](http://localhost:3000/health)

Inspect startup logs when troubleshooting:

```powershell
docker compose logs database
docker compose logs migrate
docker compose logs seed
docker compose logs app
```

Stop the containers while preserving PostgreSQL data:

```powershell
docker compose down
```

The named `postgres_data` volume preserves teacher-created content when
containers are recreated. Do not add `--volumes` unless permanently deleting
the local database is intentional.

## Project commands

```powershell
npm run dev
npm run test:run
npm run lint -- --no-cache
npx tsc --noEmit --incremental false
npm run build
npm run db:validate
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with live updates. |
| `npm run test:run` | Run the complete Vitest suite once. |
| `npm run lint -- --no-cache` | Run ESLint without a stale cache. |
| `npx tsc --noEmit --incremental false` | Type-check without emitting files. |
| `npm run build` | Create the production Next.js build. |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:validate` | Validate the Prisma schema and configuration. |
| `npm run db:seed` | Run the repeatable starter-content seed. |
| `docker compose up --build --detach` | Build and start the complete stack. |
| `docker compose down` | Stop containers while preserving database data. |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home and activity selection. |
| `/wordle` | Configure, preview, and download Phoneme Wordle. |
| `/word-search` | Configure, regenerate, preview, and download Word Search. |
| `/about` | Project purpose, technical scope, and creator details. |
| `/settings` | Persistent theme and density controls. |
| `/library` | Create and manage reusable word lists and ordered phonemes. |
| `/health` | Report application and PostgreSQL health. |