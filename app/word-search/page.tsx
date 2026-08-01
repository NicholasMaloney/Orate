import type { Metadata } from "next";
import { WordSearchBuilder } from "@/features/word-search/word-search-builder";

export const metadata: Metadata = {
    title: "Word Search Builder",
    description: "Create a configurable phoneme Word Search activity.",
};

export default function WordSearchPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-slate-50 text-slate-950"
        >
            <section className="mx-auto max-w-6xl px-6 py-16">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                    Activity builder | Word Search
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                    Build a phoneme Word Search activity.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    Configure the puzzle difficulty, regenerate the phoneme grid,
                    and download the finished activity as a standalone HTML file.
                </p>

                <WordSearchBuilder />
            </section>
        </main>
    );
}