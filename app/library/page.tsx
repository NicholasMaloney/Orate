import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import {
    WordListLibrary,
} from "@/features/library/word-list-library";

export const metadata: Metadata = {
    title: "Content Library",
    description:
        "Manage the classroom word lists used by Orate activities.",
};

export default function LibraryPage() {
    return (
        <main
            id="main-content"
            className="flex-1 bg-background text-foreground"
        >
            <section className="mx-auto max-w-6xl px-6 py-(--page-spacing)">
                <PageIntro
                    eyebrow="Classroom content"
                    title="Manage your phoneme word library."
                    description="Review the reusable word lists that provide content for Wordle and Word Search activities."
                />

                <WordListLibrary />
            </section>
        </main>
    );
}