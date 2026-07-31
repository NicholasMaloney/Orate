"use client";

import { useState } from "react";
import { getPhoneme } from "@/lib/phoneme-definitions";
import { getWordleWord, WORDLE_WORDS } from "@/lib/phonemes";
import {
    DIFFICULTY_DETAILS,
    DIFFICULTY_ORDER,
} from "@/lib/difficulty";
// no longer needed | import { WordleBoard } from "@/features/wordle/wordle-board";
import type { Difficulty, WordleConfig } from "@/lib/types";
import { downloadHtmlFile } from "@/lib/download";
import { buildStandaloneWordleHtml } from "@/lib/standalone";
import { ActivityPreview } from "@/components/activity-preview";

export function WordleBuilder() {
    const [
        wordId,     // Current state value
        setWordId   // Function that updates the state
    ] = useState("thin");

    const [difficulty, setDifficulty] = useState<Difficulty>("standard");
    const [hintsEnabled, setHintsEnabled] = useState(true);

    const config: WordleConfig = {
        wordId,
        difficulty,
        hintsEnabled,
    };

    const selectedWord = getWordleWord(config.wordId);
    //const selectedDifficulty = DIFFICULTY_DETAILS[config.difficulty];

    const [downloadStatus, setDownloadStatus] = useState("");
    const standaloneHtml = buildStandaloneWordleHtml(config);

    // Download handler 
    function handleDownload() {
        const filename = `orate-wordle-${config.wordId}.html`;

        downloadHtmlFile(filename, standaloneHtml);

        setDownloadStatus(
            `Downloaded ${filename}. Open it in a browser to test the learner activity.`,
        );
    }

    return (
        <>
            <div className="mt-12 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
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
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Selected activity
                        </p>

                        <div className="mt-2 flex items-baseline gap-3">
                            <strong className="text-2xl text-blue-700">
                                {selectedWord.ipa}
                            </strong>

                            <span className="text-slate-600">
                                {selectedWord.english}
                            </span>
                        </div>

                        <div
                            className="mt-4 flex flex-wrap gap-2"
                            aria-label={`Phoneme sequence for ${selectedWord.english}`}
                        >
                            {selectedWord.phonemeIds.map((phonemeId, position) => {
                                const phoneme = getPhoneme(phonemeId);

                                return (
                                    <span
                                        key={`${phonemeId}-${position}`}
                                        title={
                                            config.hintsEnabled
                                                ? `${phoneme.grapheme} as in ${phoneme.exampleWord}`
                                                : undefined
                                        }
                                        className="flex min-w-14 flex-col items-center rounded-lg border border-slate-200 bg-white px-3 py-2"
                                    >
                                        <strong className="text-slate-950">
                                            /{phoneme.ipaSymbol}/
                                        </strong>

                                        {config.hintsEnabled ? (
                                            <span className="text-xs text-slate-600">
                                                {phoneme.grapheme}
                                            </span>
                                        ) : null}
                                    </span>
                                );
                            })}
                        </div>
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

                    {/** Adds the option to enable phoneme hints and show english grapheme associated with each IPA sound.  */}
                    <label className="mt-8 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:border-blue-300">
                        <span>
                            <strong className="block text-slate-900">
                                Show phoneme hints
                            </strong>

                            <span className="mt-1 block text-sm text-slate-600">
                                Show the English grapheme associated with each IPA sound.
                            </span>
                        </span>

                        <input
                            type="checkbox"
                            name="wordleHints"
                            checked={hintsEnabled}
                            onChange={(changeEvent) =>
                                setHintsEnabled(changeEvent.target.checked)
                            }
                            className="mt-1 h-5 w-5 shrink-0 accent-blue-700"
                        />
                    </label>

                    {/** Download button */ }
                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-900">
                            Download learner activity
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                            Generate one self-contained HTML file using the current settings.
                        </p>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="mt-4 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                        >
                            Download HTML
                        </button>

                        <p
                            className="mt-3 min-h-6 text-sm text-slate-600"
                            aria-live="polite"
                        >
                            {downloadStatus}
                        </p>
                    </div>

                </section>

                <ActivityPreview
                    html={standaloneHtml}
                    title={`Playable preview of ${selectedWord.ipa} Wordle`}
                    height={1000}
                />
            {/** 
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
                            // checks to see if hints or graphene is enabled - if config.hintsEnabled = True then show hints etc...
                            return (
                                <span
                                    key={`${phonemeId}-${position}`}
                                    title={
                                        config.hintsEnabled
                                            ? `${phoneme.grapheme} as in ${phoneme.exampleWord}`
                                            : undefined
                                    }
                                    aria-label={`${phoneme.spokenName} sound`}
                                    className="flex min-w-20 flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                >
                                    <strong className="text-xl text-slate-950">
                                        /{phoneme.ipaSymbol}/
                                    </strong>

                                    {config.hintsEnabled ? (
                                        <span className="text-xl text-slate-600">
                                            {phoneme.grapheme}
                                        </span>
                                    ) : null}

                                </span>
                            );
                        })}
                    </div>

                    {/** No longer needed - I'll probs remove later
                     * Passes the difficulty config to the wordle board, including hints etc. 
                    <WordleBoard
                        key={`${config.wordId}-${config.difficulty}`}
                        config={config}
                    />
                       

                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Difficulty
                        </p>

                        <p className="mt-3 text-sm text-slate-600">
                            Phoneme hints:{" "}
                            <strong>
                                {config.hintsEnabled ? "Shown" : "Hidden"}
                            </strong>
                        </p>

                        <p className="mt-2 text-lg text-slate-800">
                            <strong>{selectedDifficulty.label}</strong>
                            {" · "}
                            {selectedDifficulty.attempts} attempts
                        </p>
            
                    </div>
                    </section>
                */}
            </div>
        {/** 
            <ActivityPreview
                html={standaloneHtml}
                title={`Playable preview of ${selectedWord.ipa} Wordle`}
             />
        */}
    </>
    );
}