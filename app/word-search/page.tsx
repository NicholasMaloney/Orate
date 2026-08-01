import type { Metadata } from "next"
import { PageIntro } from "@/components/page-intro";
import { WordSearchBuilder } from "@/features/word-search/word-search-builder";

export const metadata: Metadata = {
    title: "Word Search Builder",
    description: "Create a configurable phoneme Word Search activity.",
};

export default function WordSearchPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-background text-foreground"
        >
            <section className="mx-auto max-w-6xl px-6 py-(--page-spacing)">
                <PageIntro
                    eyebrow="Activity builder | Word Search"
                    title="Build a phoneme Word Search activity."
                    description="Configure the puzzle difficulty, regenerate the phoneme grid, and download the finished activity as a standalone HTML file."
                />

                <WordSearchBuilder />
            </section>
        </main>
    );
}