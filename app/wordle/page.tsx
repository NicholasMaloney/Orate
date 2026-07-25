import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Wordle Builder",
    description: "Create a configurable phoneme Wordle activity."
};

export default function WordlePage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-slate-50 text-slate-950"
        >
            <section className="mx-auto max-w-6xl px-6 py-16">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                    Activity builder |  Wordle
                </p>
                
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                    Build a phoneme Wordle activity.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    Choose a target word, configure the learner support, and preview the
                    activity before downloading it.
                </p>

                <section
                    className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    aria-labelledby="wordle-builder-heading"
                >
                <h2
                    id="wordle-builder-heading"
                    className="text-2xl font-semibold"
                >
                    Wordle configuration
                </h2>

                <p className="mt-3 text-slate-600">
                    The configuration controls will be added in the next development
                    step.
                </p>
                </section>
            </section>
        </main>
    );
}