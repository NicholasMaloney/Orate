"use client";

import { useState } from "react";
import { getPhoneme } from "@/lib/phoneme-definitions";
import { getWordleWord, WORDLE_WORDS } from "@/lib/phonemes";
import {
    DIFFICULTY_DETAILS,
    DIFFICULTY_ORDER,
} from "@/lib/difficulty";
import type { Difficulty } from "@/lib/types";

export function WordleBuilder() {
    const [
        wordId,     // Current state value
        setWordId   // Function that updates the state
    ] = useState("thin");

    const [difficulty, setDifficulty] = useState<Difficulty>("standard");
    
    const selectedWord = getWordleWord(wordId);

    const selectDifficulty = DIFFICULTY_DETAILS[difficulty];

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
                        value={wordId}
                        onChange={(changeEvent) => setWordId(changeEvent.target.value)}
                        aria-describedby="target-word-help"
                        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {WORDLE_WORDS.map((word) => (// Each Wordle word becomes one selectable option
                            <option key={word.id} value={word.id}>
                                {word.ipa} - {word.english} 
                            </option>
                        ))}
                    </select>
                </div>
               
                {/* Contains the difficulty controls displayed to the teacher. */}
                <fieldset 
                    className="mt-8"
                    aria-describedby="difficulty-help"
                >
                    <legend className="font-semibold text-slate-800">
                        Difficulty
                    </legend>

                    <p id="difficulty-help" className="mt-1 text-sm text-slate-600">
                        Difficulty Controls how many attempts the student receives. 
                    </p>
                    
                    <div className="mt-4 space-y-3">
                        {DIFFICULTY_ORDER.map((option) => {
                            const details = DIFFICULTY_DETAILS[option];

                            return (
                                <label
                                    key={option}
                                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-300"
                                >
                                    <input 
                                        type="radio"
                                        name="wordle-difficulty"
                                        value={option}
                                        checked={difficulty === option}
                                        onChange={() => setDifficulty(option)} 
                                        className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                                    />
                                    <span>
                                        <strong className="block text-slate-900">
                                            {details.label}
                                        </strong>

                                        <span className="mt-1 block text-sm text-slate-600">
                                            {details.attempts} attempts - {details.description}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>  
                </fieldset> 
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
                
                <div
                    className="mt-6 flex flex-wrap gap-3"
                    aria-label={`Phoneme sequence for ${selectedWord.english}`}
                >
                    {selectedWord.phonemeIds.map((phonemeId, position) => {
                        const phoneme = getPhoneme(phonemeId);
                        
                        // returns the selected word, the ipa symbols, english character representation, and the word in english
                        return (
                            <span
                                key={`${phonemeId}-${position}`}
                                title={`${phoneme.grapheme} as in ${phoneme.exampleWord}`}
                                className="flex min-w-20 flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                                <strong className="text-xl text-slate-950">
                                    /{phoneme.ipaSymbol}/
                                </strong>

                                <span className="text-xl text-slate-600">
                                    {phoneme.grapheme}
                                </span>
                            </span>
                        );
                    })}
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Difficulty
                    </p>

                    <p className="mt-2 text-lg text-slate-800">
                        <strong>{selectDifficulty.label}</strong>
                        {" · "}
                        {selectDifficulty.attempts} attempts
                    </p>

                </div>
            </section>
        </div>
    );
}