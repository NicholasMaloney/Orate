"use client";
import { useState } from "react";
import { DIFFICULTY_DETAILS } from "@/lib/difficulty";
import { getWordleWord } from "@/lib/phonemes";
import { getPhoneme, PHONEMES } from "@/lib/phoneme-definitions";
import type { WordleConfig } from "@/lib/types";

// accepts the Wordle config and builds a game board based on it 
interface WordleBoardProps {
    readonly config: WordleConfig;
}

// render an empty Wordle board using the current configuration 
// the number of rows comes from the difficulty selected 
// the number of columns comes from the selected word
export function WordleBoard({ config }: WordleBoardProps) {
    const selectedWord = getWordleWord(config.wordId);
    const maximumAttempts = DIFFICULTY_DETAILS[config.difficulty].attempts;
    const phonemeCount = selectedWord.phonemeIds.length;

    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [submittedGuesses, setSubmittedGuesses] = useState<string[][]>([]);
    const [statusMessage, setStatusMessage] = useState(
        `Choose ${phonemeCount} phonemes to create a guess.`
    );
    const gameIsFull = submittedGuesses.length >= maximumAttempts;

    // This creates the game board and renders the guesses that have been entered 
    const boardRows = Array.from(
        { length: maximumAttempts },
        (_, rowIndex) => {
            const isCurrentRow =
                rowIndex === submittedGuesses.length && !gameIsFull;

            const guessForRow =
                submittedGuesses[rowIndex] ?? (isCurrentRow ? currentGuess : []);

            return Array.from(
                { length: phonemeCount },
                (_, columnIndex) => guessForRow[columnIndex] ?? null,
            );

        },
    );

    // Event handlers 

    // Adds a selected phoneme to the current guess.
    function handlePhonemeInput(phonemeId: string) {
        if (gameIsFull) {
            return;
        }

        setCurrentGuess((existingGuess) => {
            if (existingGuess.length >= phonemeCount) {
                return existingGuess;
            }

            // Create a new array containing the existing guess and selected phoneme.
            return [...existingGuess, phonemeId];
        });

        // Remove any previous status message
        setStatusMessage("");
    }

    // Deletes the last entered phoneme
    function handleDelete() {
        setCurrentGuess((existingGuess) => existingGuess.slice(0, -1));
        setStatusMessage("");
    }

    // Validates and records the guess - A guess must contain the same number of phonemes as the target word
    function handleSubmit() {
        if (gameIsFull) {
            return;
        }

        if (currentGuess.length !== phonemeCount) {
            const remainingPhonemes = phonemeCount - currentGuess.length;

            setStatusMessage(
                `Choose ${remainingPhonemes} more ${remainingPhonemes === 1 ? "phoneme" : "phonemes"} before submitting.`
            );
            return;
        }

        const completedAttemptNumber = submittedGuesses.length + 1;

        setSubmittedGuesses((existingGuesses) => [
            ...existingGuesses,
            currentGuess,
        ]);

        setCurrentGuess([]);

        if (completedAttemptNumber >= maximumAttempts) {
            setStatusMessage("All attempts have been recorded!");
        }
        else {
            setStatusMessage(`Guess ${completedAttemptNumber} recorded.`)
        }
    }

    return (
        <section
            className="mt-8 border-t border-slate-200 pt-6"
            aria-labelledby="wordle-board-heading"
        >
            <div className="text-center">
                <h3 id="wordle-board-heading" className="text-xl font-semibold">
                    Wordle Board
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                    {maximumAttempts} attempts · {phonemeCount} phonemes per guess
                </p>
            </div>

            <div
                role="grid"
                aria-label={`Wordle board with ${maximumAttempts} attempts`}
                aria-rowcount={maximumAttempts}
                aria-colcount={phonemeCount}
                className="mt-6 space-y-2"
            >
                {boardRows.map((row, rowIndex) => ( // renders the rows 
                    <div
                        role="row"
                        aria-rowindex={rowIndex + 1}
                        key={`row-${rowIndex}`}
                        className="grid justify-center gap-2"
                        style={{
                            gridTemplateColumns: `repeat(${phonemeCount}, 3.5rem)`,
                        }}
                    >
                        {row.map((phonemeId, columnIndex) => { // renders cells & displays guesses 
                            const phoneme = phonemeId
                                ? getPhoneme(phonemeId)
                                : undefined;

                            const isCurrentRow = rowIndex === submittedGuesses.length && !gameIsFull;

                            return (
                                <span
                                    role="gridcell"
                                    aria-colindex={columnIndex + 1}
                                    aria-label={
                                        phoneme
                                            ? `Attempt ${rowIndex + 1}, position ${columnIndex + 1}, ${phoneme.spokenName} sound`
                                            : `Attempt ${rowIndex + 1}, position ${columnIndex + 1}, empty`
                                    }
                                    key={`cell-${rowIndex}-${columnIndex}`}
                                    className={`flex size-14 items-center justify-center rounded-lg border-2 text-lg font-bold ${phoneme
                                        ? "border-blue-600 bg-blue-50 text-blue-950"
                                        : isCurrentRow
                                            ? "border-blue-300 bg-white text-slate-900"
                                            : "border-slate-300 bg-white text-slate-900"
                                        }`}
                                >
                                    {phoneme ? `/${phoneme.ipaSymbol}/` : null}
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div
                role="group"
                aria-label="Phoneme keyboard"
                className="mt-6 flex flex-wrap justify-center gap-2"
            >
                {PHONEMES.map((phoneme) => (
                    <button
                        type="button"
                        key={phoneme.id}
                        onClick={() => handlePhonemeInput(phoneme.id)}
                        disabled={gameIsFull || currentGuess.length >= phonemeCount}
                        title={
                            config.hintsEnabled
                                ? `${phoneme.grapheme} as in ${phoneme.exampleWord}`
                                : undefined
                        }
                        aria-label={`Add ${phoneme.spokenName} sound`}
                        className="flex min-w-14 flex-col items-center rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span>/{phoneme.ipaSymbol}/</span>

                        {config.hintsEnabled ? (
                            <span className="text-xs font-normal text-slate-600">
                                {phoneme.grapheme}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={currentGuess.length === 0 || gameIsFull}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Delete
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={gameIsFull}
                    className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Submit guess
                </button>
            </div>

            <p
                className="mt-4 min-h-6 text-center text-sm text-slate-600"
                aria-live="polite"
            >
                {statusMessage}
            </p>

        </section>
    )
}