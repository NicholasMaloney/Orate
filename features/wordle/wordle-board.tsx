"use client";
import { useState } from "react";
import { DIFFICULTY_DETAILS } from "@/lib/difficulty";
import { getWordleWord } from "@/lib/phonemes";
import { getPhoneme, PHONEMES } from "@/lib/phoneme-definitions";
import { getPhonemeGuessStates, scoreGuess } from "@/lib/wordle-scoring";
import type { GuessState, WordleConfig } from "@/lib/types";

// accepts the Wordle config and builds a game board based on it 
interface WordleBoardProps {
    readonly config: WordleConfig;
}

// scoreing styles and lables - visulises the scoring logic on the frontend 
const GUESS_STATE_STYLES: Readonly<Record<GuessState, string>> = {
    correct: "border-green-700 bg-green-600 text-white",
    present: "border-amber-600 bg-amber-400 text-slate-950",
    absent: "border-slate-600 bg-slate-500 text-white",
};
const GUESS_STATE_LABELS: Readonly<Record<GuessState, string>> = {
    correct: "correct phoneme in the correct position",
    present: "phoneme appears in another position",
    absent: "phoneme does not appear in the word",
};

// render an empty Wordle board using the current configuration 
// the number of rows comes from the difficulty selected 
// the number of columns comes from the selected word
export function WordleBoard({ config }: WordleBoardProps) {
    const selectedWord = getWordleWord(config.wordId);
    const maximumAttempts = DIFFICULTY_DETAILS[config.difficulty].attempts;
    const phonemeCount = selectedWord.phonemeIds.length;

    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [submittedGuesses, setSubmittedGuesses] = useState<string[][]>([]);
    const initialStatusMessage = `Choose ${phonemeCount} phonemes to create a guess.`
    const [statusMessage, setStatusMessage] = useState( initialStatusMessage, );

    const latestGuess = submittedGuesses.at(-1);

    const latestScore = 
        latestGuess === undefined
            ? undefined
            : scoreGuess(
                latestGuess, 
                selectedWord.phonemeIds
            );
    
    const hasWon = 
        latestScore !== undefined &&
        latestScore.every((state) => state === "correct");
    
    const hasUsedAllAttempts = 
        submittedGuesses.length >= maximumAttempts;
    
    const gameIsOver = hasWon || hasUsedAllAttempts;

    const phonemeGuessStates = getPhonemeGuessStates(
        submittedGuesses,
        selectedWord.phonemeIds,
    );

    // This creates the game board and renders the guesses that have been entered 
    const boardRows = Array.from(
        { length: maximumAttempts },
        (_, rowIndex) => {
            const isCurrentRow =
                rowIndex === submittedGuesses.length && !gameIsOver;

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
        if (gameIsOver) {
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

    // Restarts the game 
    function handleRestart() {
        setCurrentGuess([]);
        setSubmittedGuesses([]);
        setStatusMessage(initialStatusMessage);
    }

    // Validates and records each guess - A guess must contain the same number of phonemes as the target word
        // handles game state e.g. if the game is over, if you have won, number of attempts etc  
    function handleSubmit() {
        if (gameIsOver) {
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

        const guessScore = scoreGuess(
            currentGuess,
            selectedWord.phonemeIds,
        );

        const isWinningGuess = guessScore.every(
            (state) => state === "correct",
        );

        setSubmittedGuesses((existingGuesses) => [
            ...existingGuesses,
            currentGuess,
        ]);

        setCurrentGuess([]);

        if (isWinningGuess) {
            setStatusMessage(
                `Correct! You identifed ${selectedWord.ipa} in ${completedAttemptNumber} 
                ${completedAttemptNumber === 1 ? "attempt" : "attempts"}.`,
            );

            return;
        }

        if (completedAttemptNumber >= maximumAttempts) {
            setStatusMessage(
                `You have no attempts left. 
                The target was ${selectedWord.ipa} — ${selectedWord.english}.`,
            );

            return;
        }
       
        setStatusMessage(
            `Guess ${completedAttemptNumber} scored. Try again.`,
        )
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

                <p className="mt-2 text-xs text-slate-500">
                    Green: correct position · Amber: present elsewhere · Grey: absent
                </p>
            </div>

            <div
                role="grid"
                aria-label={`Wordle board with ${maximumAttempts} attempts`}
                aria-rowcount={maximumAttempts}
                aria-colcount={phonemeCount}
                className="mt-6 space-y-2"
            >
                {boardRows.map((row, rowIndex) => { // renders the rows 
                    const submittedGuess = submittedGuesses[rowIndex];

                    const rowScore = 
                        submittedGuess === undefined
                            ? undefined
                            : scoreGuess(submittedGuess, selectedWord.phonemeIds)
                    
                    return (
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

                                const guessState = rowScore?.[columnIndex];

                                const isCurrentRow = 
                                    rowIndex === submittedGuesses.length && !gameIsOver;
                                
                                const cellStyles = guessState
                                    ? GUESS_STATE_STYLES[guessState]
                                    : phoneme
                                        ? "border-blue-600 bg-blue-50 text-blue-950"
                                        : isCurrentRow
                                            ? "border-blue-300 bg-white text-slate-900"
                                            : "border-slate-300 bg-white text-slate-900";
                                
                                const resultDescription = guessState
                                    ? `, ${GUESS_STATE_LABELS[guessState]}`
                                    : "";
                                
                                return (
                                    <span
                                        role="gridcell"
                                        aria-colindex={columnIndex + 1}
                                        aria-label={
                                            phoneme
                                                ? `Attempt ${rowIndex + 1}, position ${columnIndex + 1}, ${phoneme.spokenName} sound${resultDescription}`
                                                : `Attempt ${rowIndex + 1}, position ${columnIndex + 1}, empty`
                                        }
                                        key={`cell-${rowIndex}-${columnIndex}`}
                                        className={`flex size-14 items-center justify-center rounded-lg border-2 text-lg font-bold ${cellStyles}`}
                                    >
                                        {phoneme ? `/${phoneme.ipaSymbol}/` : null}
                                    </span>                                    
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            
            <div
                role="group"
                aria-label="Phoneme keyboard"
                className="mt-6 flex flex-wrap justify-center gap-2"
            >
                {PHONEMES.map((phoneme) => {
                    const phonemeGuessState = phonemeGuessStates[phoneme.id];

                    const phonemeGuessStyles = phonemeGuessState
                        ? GUESS_STATE_STYLES[phonemeGuessState]
                        : "border-slate-300 bg-white text-slate-900 hover:border-blue-500 hover:bg-blue-50";

                    const resultDescription = phonemeGuessState
                        ? GUESS_STATE_LABELS[phonemeGuessState]
                        : "not yet guessed";

                    return (
                        <button
                            type="button"
                            key={phoneme.id}
                            onClick={() => handlePhonemeInput(phoneme.id)}
                            disabled={gameIsOver || currentGuess.length >= phonemeCount}
                            title={
                                config.hintsEnabled
                                    ? `${phoneme.grapheme} as in ${phoneme.exampleWord}`
                                    : undefined
                            }
                            aria-label={`Add ${phoneme.spokenName} sound, ${resultDescription}`}
                            className={`flex min-w-14 flex-col items-center rounded-lg border px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-70 ${phonemeGuessStyles}`}
                        >
                            <span>/{phoneme.ipaSymbol}/</span>

                            {config.hintsEnabled ? (
                                <span className="text-xs font-normal opacity-80">
                                    {phoneme.grapheme}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={handleRestart}
                    disabled={
                        currentGuess.length === 0 &&
                        submittedGuesses.length === 0
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                    Restart
                </button>              
                
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={currentGuess.length === 0 || gameIsOver}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Delete
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={gameIsOver}
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