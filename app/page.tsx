// Root route, e.g. default page. 

/**
// ID's e.g. <main id="main-content" & <section id="activities" provide navigation destinations within this page.
 * `main-content` is targeted by the skip link, while `activities` is targeted
 * by the header navigation. `aria-labelledby` gives the activity section an
 * accessible name using its visible heading.
*/
export default function HomePage() {
  return (
    <main 
      id="main-content"
      className="flex-1 bg-slate-50 text-slate-950 dark:bg-gray-800 dark:text-white"
      >
      <section className="mx-auto max-w-6xl px-6 py-16 ">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700  dark:bg-gray-800 dark:text-white">
          Phoneme Activities for teachers
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl  dark:bg-gray-800 dark:text-white">
          Create focused Phoneme learning activities with Orate.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600  dark:bg-gray-800 dark:text-white">
          Orate creates playable phoneme Wordle and Word Search activities. 
          Each activity downloads as a standalone file that works offline.
        </p>

        <section 
          id="activities"
          className="mt-12" 
          aria-labelledby="activities-heading"
          >
          <h2 id="activities-heading" className="text-2xl font-semibold">
            Activity builders
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">Wordle</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Create a supported word-guessing activity focused on phonemes
                and spelling patterns.
              </p>
              <p className="mt-6 text-sm font-semibold text-blue-700">
                In Progress 
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">Word Search</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Generate a phoneme word-search puzzle from a configurable collection of
               terms.
              </p>
              <p className="mt-6 text-sm font-semibold text-blue-700">
                In Progress 
              </p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}