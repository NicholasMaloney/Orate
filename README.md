<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/branding/orate-logo-horizontal-reverse-4096.png">
  <source media="(prefers-color-scheme: light)" srcset="public/branding/orate-logo-horizontal-4096.png">
  <img alt="Orate" src="public/branding/orate-logo-horizontal-4096.png">
</picture>

Orate is a teacher facing, full stack builder for phoneme Wordle and Word Search
activities. It is intended for teachers and speech pathologists who want to create custom
word lists, configure an activity, test the learner experience, and download one playable
HTML file for classroom use.

Word lists, ordered phonemes, and saved activity configurations are stored in
PostgreSQL. The Wordle and Word Search builders load this stored content
through validated API routes.

Downloaded activities are self-contained. Their HTML, CSS, activity data, and
plain JavaScript are embedded in one file that can run offline in a normal web
browser.

## Features

- Library for creating, editing, and deleting reusable word lists.
- Word management with ordered, multi-character phoneme symbols.
- Database-backed Wordle target selection, difficulty, and spelling hints.
- Database-backed Word Search lists, seeded puzzles, and difficulty rules.
- Saved Wordle and Word Search configurations.
- Validated JSON APIs and a database healthcheck.
- Exact learner preview before download.
- Single-file offline HTML downloads.
- Blue Mist light and Deep Navy dark activity themes.
- Comfortable and compact interface density preferences.
- Cookie-based preference persistence.
- Responsive navigation with keyboard-accessible controls.

## Technology

- Next.js 16 App Router and Route Handlers
- React 19
- TypeScript
- Tailwind CSS 4 and semantic CSS custom properties
- Prisma ORM 7 with PostgreSQL 18
- Zod request validation
- Vitest
- Playwright
- Apache JMeter 5.6.3
- Docker and Docker Compose
- Browser DOM, iframe, Blob, and download APIs

Orate is a full-stack application. Validated Route Handlers expose JSON APIs,
Prisma maps application data, and PostgreSQL stores word lists, ordered
phonemes, and reusable activity configurations.

## Architecture

The main request flow is:

```text
Teacher interface
    → Next.js Route Handler
    → Zod validation
    → Prisma
    → PostgreSQL
```
Activity generation uses database content but runs in the browser:

```text
PostgreSQL content
    → activity-content API
    → React builder
    → standalone HTML generator
    ├── sandboxed preview
    └── downloaded HTML file
```

The API supports word lists, words, activity-ready content, saved Wordle
configurations, and saved Word Search configurations. Successful JSON
responses place their result inside `data`, while errors return a code and
message. Successful delete requests return `204 No Content`.

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

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with live updates. |
| `npm run test:run` | Run the complete Vitest suite once. |
| `npm run test:e2e` | Run both Playwright workflows in headless Chromium. |
| `npm run test:e2e:headed` | Run Playwright with a visible browser. |
| `npm run test:e2e:report` | Open the generated Playwright HTML report. |
| `npm run lint -- --no-cache` | Run ESLint without a stale cache. |
| `npx tsc --noEmit --incremental false` | Type-check without emitting files. |
| `npm run build` | Create the production Next.js build. |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:validate` | Validate the Prisma schema and configuration. |
| `npm run db:seed -- --config prisma7.config.ts` | Run the repeatable starter-content and simulated-metric seed. |
| `npx --no-install prisma studio --config=./prisma7.config.ts` | Inspect local PostgreSQL records in Prisma Studio. |
| `docker compose up --build --detach` | Build and start the complete stack. |
| `docker compose down` | Stop containers while preserving database data. |

### Inspecting the database

PostgreSQL must already be running.

Open Prisma Studio:

```powershell
npx --no-install prisma studio --config=./prisma7.config.ts
```

Prisma Studio provides a browser interface for inspecting local word
lists, words, phonemes, configurations, `ActivityGeneration` records,
and `PageView` records.

## Testing

### Playwright E2E Tests
Install the Chromium browser once after installing dependencies:

```powershell
npx --no-install playwright install chromium
```

Start Orate before running the tests. Playwright targets
`http://127.0.0.1:3000` by default.

Run both workflows:

```powershell
npm run test:e2e
```

Run with a visible browser:

```powershell
npm run test:e2e:headed
```

Open the latest HTML report:

```powershell
npm run test:e2e:report
```

To test another running URL:

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:3001"
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

The two workflows verify:

1. A teacher can create, read, rename, and delete a Library word list.
2. A generated Wordle loads database content, renders inside the
   sandboxed learner iframe, exposes its learner controls, and updates
   when the teacher changes difficulty.

Playwright uses one worker because the workflows share database state.

### JMeter Load Testing

Prerequisites:

- Apache JMeter 5.6.3 installed and available as `jmeter`.
- Orate and PostgreSQL already running.
- At least one stored word list.

The JMeter workflow requests:

1. `/health`
2. `/wordle`
3. `/word-search`
4. `/api/word-lists`
5. `/api/activity-content/word-lists/${list_id}`
6. `/api/wordle-configurations`
7. `/api/word-search-configurations`

It extracts the first stored list ID, reuses cookies and HTTP
connections, and asserts HTTP `200` for every request.

Inspect or debug the plan in the JMeter GUI:

```powershell
jmeter -t .\tests\load\orate-workflows.jmx
```

Use non-GUI mode for load testing. This x10 example uses timestamped
output paths so an existing report directory is not overwritten:

```powershell
New-Item `
  -ItemType Directory `
  -Force `
  -Path .\test-results\jmeter |
  Out-Null

$runId = Get-Date -Format "yyyyMMdd-HHmmss"
$stage = "x10"

jmeter -n `
  -t .\tests\load\orate-workflows.jmx `
  -Jusers=10 `
  -Jloops=1 `
  -Jramp_seconds=10 `
  -Jhost=127.0.0.1 `
  -Jport=3000 `
  -Jprotocol=http `
  -l ".\test-results\jmeter\$stage-$runId.jtl" `
  -e `
  -o ".\test-results\jmeter\$stage-$runId-report"
```

Supported properties:

| Property | Default | Purpose |
| --- | --- | --- |
| `users` | `1` | Number of JMeter threads/virtual users. |
| `loops` | `1` | Complete workflows run by each user. |
| `ramp_seconds` | `10` | Time used to start all users. |
| `host` | `127.0.0.1` | Target host without protocol. |
| `port` | `3000` | Target port. |
| `protocol` | `http` | Target protocol. |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home and activity selection. |
| `/dashboard` | Operational reporting and system health. |
| `/wordle` | Configure, preview, and download Phoneme Wordle. |
| `/word-search` | Configure, regenerate, preview, and download Word Search. |
| `/about` | Project purpose, technical scope, and creator details. |
| `/settings` | Persistent theme and density controls. |
| `/library` | Create and manage reusable word lists and ordered phonemes. |
| `/health` | Report application and PostgreSQL health. |

## Known limitations

Orate is a university assignment

- It does not include user accounts, authentication, or authorisation.
- Stored content is not separated between different teachers.
- Anyone with access to the teacher application can modify its stored data.
- The teacher application requires its configured PostgreSQL database.
- Downloaded activities run offline but do not receive later database changes.