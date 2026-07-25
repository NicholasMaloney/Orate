import type { Metadata } from "next";
import { WordleBuilder } from "@/features/wordle/wordle-builder";

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
                
                <WordleBuilder />
            </section>
        </main>
    );
}