import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { WordleBuilder } from "@/features/wordle/wordle-builder";

export const metadata: Metadata = {
    title: "Wordle Builder",
    description: "Create a configurable phoneme Wordle activity."
};

export default function WordlePage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-[var(--background)] text-[var(--foreground)]"
        >
            <section className="mx-auto max-w-6xl px-6 py-[var(--page-spacing)]">
                <PageIntro
                    eyebrow="Activity builder | Wordle"
                    title="Build a phoneme Wordle activity."
                    description="Choose a target word, configure the learner support, and preview the activity before downloading it."
                />

                <WordleBuilder />
            </section>
        </main>
    );
}