"use client";

import { useState } from "react";
import { getWord, PHONEME_WORDS } from "@/lib/phonemes";

export function WordleBuilder() {
    const [
        wordID,     // Current state value
        setWordID   // Function that updates the state
    ] = useState("thin");
    
    const selectedWord = getWord(wordID);

    return (
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                aria-labelledby="wordle-controls-heading"
            >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                    Teacher Controls
                </h3>

                <h2 id="wordle-controls-heading" className="mt-1 text-2xl font-semibold">
                    Configure the Wordle
                </h2>

                <div className="mt-4">
                    <label
                        htmlFor="target-word"
                        className="block font-semibold text-slate-800"
                    >
                        Target Phoneme Word
                    </label>

                    <p id="target-word-help" className="mt-1 text-sm text-slate-600">
                        Select the word the student will attempt to identify
                    </p>

                    <select // Get desired word that will be targeted. 
                        id="target-word"
                        name="targetWord"
                        value={wordID}
                        onChange={(changeEvent) => setWordID(changeEvent.target.value)}
                        aria-describedby="target-word-help"
                        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {PHONEME_WORDS.map((word) => ( // Each word becomes one selectable option
                            <option key={word.id} value={word.id}>
                                {word.ipa} - {word.english} 
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                aria-labelledby="wordle-preview-heading"
            >
                <h2 
                    id="wordle-preview-heading"
                    className="text-2xl font-semibold"
                >
                    Current selection
                </h2>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Selected word
                </p>

                <p className="mt-2 wrap-break-word text-3xl font-bold text-blue-700">
                    {selectedWord.ipa}
                </p>

                <p className="mt-2 text-lg text-slate-600">
                    {selectedWord.english}
                </p>
            </section>
        </div>
    );
}