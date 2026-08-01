// Contains the teacher controls and preview for the Word Search activity 
// Currently this is a static page, when I add difficulty, hints, and puzzle gen/regen then it will be come a react component
export function WordSearchBuilder() {
    return (
        <section
            className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="word-search-builder-heading"
        >
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Teacher controls
            </p>

            <h2
                id="word-search-builder-heading"
                className="mt-1 text-2xl font-semibold"
            >
                Configure the Word Search
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
                The puzzle controls and generated phoneme grid will appear here.
            </p>
        </section>
    );
}