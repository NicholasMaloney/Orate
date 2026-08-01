"use client";

import { useState } from "react";
import { DIFFICULTY_DETAILS, DIFFICULTY_ORDER } from "@/lib/difficulty";
import type { Difficulty, WordSearchConfig } from "@/lib/types";
import { ActivityPreview } from "@/components/activity-preview";
import { downloadHtmlFile } from "@/lib/download";
import { buildStandaloneWordSearchHtml } from "@/lib/standalone";

// Describes how each Word Seach difficulty affects the puzzle 
// The generator contains the actual rules this just displays / explains the rules to the teacher and/or speach path
const WORD_SEARCH_DIFFICULTY_DESCRIPTIONS: Readonly<Record<Difficulty, string>
> = {
    easy: "8 × 8 grid using horizontal and vertical words.",
    standard: "10 × 10 grid that also includes diagonal words.",
    challenging: "12 × 12 grid with forward, reverse, and upward words.",
};


// Contains the teacher controls and preview for the Word Search activity 
export function WordSearchBuilder() {
    // Difficulty choices
    const [difficulty, setDifficulty] =
        useState<Difficulty>("standard");

    // By default hints are enabled
    const [hintsEnabled, setHintsEnabled] = useState(true);

    // Word Search Generator Seed | Changing this number produces a different deterministic puzzle.
    const [seed, setSeed] = useState(260724);

    // Config combines the separate React state values into the object expected by generateWordSearch().
    const config: WordSearchConfig = {
        difficulty,
        seed,
        hintsEnabled,
    };

    // This is for the standalone HTML generator / downloader 
    const [downloadStatus, setDownloadStatus] = useState("");

    // Preview and download both use this exact HTML string.
    const standaloneHtml = buildStandaloneWordSearchHtml(config);

    /**  This is a React 'functional update' 
        * essensially this handles an edge case: where multiple updates are queued e.g. a user clicks regen multiple times quickly 
        * It handles this edge case via this function as we pass react the function and it calcs the value 
        * if I used say setSeed(seed + 1); and a user spamed the button then a value may be lost before React could update anything 
    */
    function regeneratePuzzle() {
        setSeed((currentSeed) => currentSeed + 1);
        setDownloadStatus("");
    }

    function handleDownload() {
        const filename =
            `orate-word-search-${config.difficulty}-${config.seed}.html`;

        downloadHtmlFile(filename, standaloneHtml);

        setDownloadStatus(
            `Downloaded ${filename}. Open it in a browser to test the learner activity.`,
        );
    }

    return (
        <div className="mt-12 grid gap-(--panel-spacing) lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside
                className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) text-foreground shadow-sm"
                aria-labelledby="word-search-controls-heading"
            >
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Teacher controls
                </p>

                <h2
                    id="word-search-controls-heading"
                    className="mt-1 text-2xl font-semibold"
                >
                    Configure the Word Search
                </h2>

                <fieldset className="mt-6">
                    <legend className="font-semibold text-foreground">
                        Difficulty
                    </legend>

                    <p className="mt-1 text-sm text-(--muted-text)">
                        Difficulty changes the grid size and allowed directions.
                    </p>

                    <div className="mt-3 space-y-(--control-spacing)">
                        {DIFFICULTY_ORDER.map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-3 hover:border-blue-400 hover:bg-(--surface-muted)"
                            >
                                <input
                                    type="radio"
                                    name="word-search-difficulty"
                                    value={option}
                                    checked={
                                        difficulty === option
                                    }
                                    onChange={() =>
                                        setDifficulty(option)
                                    }
                                    className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                                />

                                <span>
                                    <strong className="block text-foreground">
                                        {
                                            DIFFICULTY_DETAILS[
                                                option
                                            ].label
                                        }
                                    </strong>

                                    <span className="mt-1 block text-sm text-(--muted-text)">
                                        {
                                            WORD_SEARCH_DIFFICULTY_DESCRIPTIONS[
                                            option
                                            ]
                                        }
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

               <label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-(--border) bg-(--surface) p-4 hover:border-blue-400 hover:bg-(--surface-muted)">
                    <span>
                        <strong className="block text-foreground">
                            Show English hints
                        </strong>

                        <span className="mt-1 block text-sm text-(--muted-text)">
                            Display the English word beneath each IPA target.
                        </span>
                    </span>

                    <input
                        type="checkbox"
                        checked={hintsEnabled}
                        onChange={(changeEvent) =>
                            setHintsEnabled(changeEvent.target.checked)
                        }
                        className="mt-1 h-5 w-5 shrink-0 accent-blue-700"
                    />
                </label>

                <div className="mt-6 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
                    <p className="text-sm text-(--muted-text)">
                        Puzzle seed
                    </p>

                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                        {seed}
                    </p>

                    <button
                        type="button"
                        onClick={regeneratePuzzle}
                        className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                        Regenerate puzzle
                    </button>
                </div>

                <div className="mt-8 border-t border-(--border) pt-6">
                    <h3 className="font-semibold text-foreground">
                        Download learner activity
                    </h3>

                    <p className="mt-1 text-sm text-(--muted-text)">
                        Generate one playable HTML file using the current puzzle settings.
                    </p>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="mt-4 w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                        Download HTML
                    </button>

                    <p
                        className="mt-3 min-h-6 text-sm text-(--muted-text)"
                        aria-live="polite"
                    >
                        {downloadStatus}
                    </p>
                </div>
            </aside>

            <ActivityPreview
                html={standaloneHtml}
                title={`Playable ${config.difficulty} phoneme Word Search preview`}
                height={1000}
            />
        </div>
    );
}