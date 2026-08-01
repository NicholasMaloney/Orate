"use client";

import { useState } from "react";
import { DIFFICULTY_DETAILS, DIFFICULTY_ORDER } from "@/lib/difficulty";
import type { Difficulty, WordSearchConfig } from "@/lib/types";
import { generateWordSearch } from "@/lib/word-search";
import { WordSearchGame } from "@/features/word-search/word-search-board";

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

    // Puzzle is derived from the config, doesnt need its own useState cause it can be recalced from the diff and seed 
    const puzzle = generateWordSearch(config);

    /**  This is a React 'functional update' 
        * essensially this handles an edge case: where multiple updates are queued e.g. a user clicks regen multiple times quickly 
        * It handles this edge case via this function as we pass react the function and it calcs the value 
        * if I used say setSeed(seed + 1); and a user spamed the button then a value may be lost before React could update anything 
    */
    function regeneratePuzzle() {
        setSeed((currentSeed) => currentSeed + 1);
    }

    return (
        <div className="mt-12 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                aria-labelledby="word-search-controls-heading"
            >
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                    Teacher controls
                </p>

                <h2
                    id="word-search-controls-heading"
                    className="mt-1 text-2xl font-semibold"
                >
                    Configure the Word Search
                </h2>

                <fieldset className="mt-6">
                    <legend className="font-semibold text-slate-800">
                        Difficulty
                    </legend>

                    <p className="mt-1 text-sm text-slate-600">
                        Difficulty changes the grid size and allowed directions.
                    </p>

                    <div className="mt-3 space-y-3">
                        {DIFFICULTY_ORDER.map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-blue-400"
                            >
                                <input
                                    type="radio"
                                    name="word-search-difficulty"
                                    value={option}
                                    checked={difficulty === option}
                                    onChange={() => setDifficulty(option)}
                                    className="mt-1"
                                />

                                <span>
                                    <strong className="block text-slate-900">
                                        {DIFFICULTY_DETAILS[option].label}
                                    </strong>

                                    <span className="mt-1 block text-sm text-slate-600">
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

                <label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                    <span>
                        <strong className="block text-slate-900">
                            Show English hints
                        </strong>

                        <span className="mt-1 block text-sm text-slate-600">
                            Display the English word beneath each IPA target.
                        </span>
                    </span>

                    <input
                        type="checkbox"
                        checked={hintsEnabled}
                        onChange={(changeEvent) =>
                            setHintsEnabled(changeEvent.target.checked)
                        }
                        className="mt-1"
                    />
                </label>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">
                        Puzzle seed
                    </p>

                    <p className="mt-1 font-mono text-lg font-semibold text-slate-900">
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
            </aside>

            <WordSearchGame
                key={`${config.difficulty}-${config.seed}`}
                puzzle={puzzle}
                hintsEnabled={config.hintsEnabled}
            />
        </div>
    );
}