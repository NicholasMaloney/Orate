import Link from "next/link";


// Root route, e.g. default page. 

export default function HomePage() {
  return (
    <main
      id="main-content"
      className="flex-1 bg-background text-foreground"
    >
      <section className="mx-auto max-w-6xl px-6 py-(--page-spacing)">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          Phoneme activities for teachers
        </p>

        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
          Create focused phoneme learning activities with Orate.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-(--muted-text)">
          Orate creates playable phoneme Wordle and Word Search
          activities. Each activity downloads as a standalone file
          that works offline.
        </p>

        <section
          id="activities"
          className="mt-12"
          aria-labelledby="activities-heading"
        >
          <h2
            id="activities-heading"
            className="text-2xl font-semibold"
          >
            Activity builders
          </h2>

          <div className="mt-6 grid gap-(--control-spacing) md:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-(--border) bg-(--surface)] p-(--panel-spacing) shadow-sm">
              <h3 className="text-xl font-semibold">
                Wordle
              </h3>

              <p className="mt-3 flex-1 leading-7 text-(--muted-text)">
                Create a supported word-guessing activity
                focused on phonemes and spelling patterns.
              </p>

              <Link
                href="/wordle"
                className="mt-6 w-fit rounded-md font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:text-blue-300 dark:hover:text-blue-100 dark:focus-visible:outline-blue-300"
              >
                Open Wordle builder
              </Link>
            </article>

            <article className="flex flex-col rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm">
              <h3 className="text-xl font-semibold">
                Word Search
              </h3>

              <p className="mt-3 flex-1 leading-7 text-(--muted-text)">
                Generate a seeded phoneme puzzle from a fixed
                classroom word set and download it for offline
                use.
              </p>

              <Link
                href="/word-search"
                className="mt-6 w-fit rounded-md font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:text-blue-300 dark:hover:text-blue-100 dark:focus-visible:outline-blue-300"
              >
                Open Word Search builder
              </Link>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}