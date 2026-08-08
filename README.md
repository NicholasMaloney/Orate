<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public\branding\orate-logo-horizontal-reverse-4096.png">
  <source media="(prefers-color-scheme: light)" srcset="public\branding\orate-logo-horizontal-4096.png">
  <img alt="Description" src="public\branding\orate-logo-horizontal-4096.png">
</picture>   

Orate is a teacher-facing builder for phoneme Wordle and Word Search
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

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 and semantic CSS custom properties
- Browser DOM, iframe, Blob, and download APIs

The project is currently frontend-only. It has no accounts, database, or
separate backend API. Next.js Server Actions are used only to validate and
write preference cookies.

## Getting started

Prerequisites: Git, Node.js/npm compatible with Next.js 16, and a modern
browser.

```powershell
git clone <repository-url>
cd orate-v1
npm install
npm run dev
```

Open the URL printed by Next.js, normally
[http://localhost:3000](http://localhost:3000). Another port may be selected if
`3000` is already occupied.

## Project commands

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with live updates. |
| `npm run lint` | Run the Next.js/TypeScript ESLint configuration. |
| `npm run build` | Compile and type-check a production build. |
| `npm run start` | Serve an existing production build. |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home and activity selection. |
| `/wordle` | Configure, preview, and download Phoneme Wordle. |
| `/word-search` | Configure, regenerate, preview, and download Word Search. |
| `/about` | Project purpose, technical scope, and creator details. |
| `/settings` | Persistent theme and density controls. |
