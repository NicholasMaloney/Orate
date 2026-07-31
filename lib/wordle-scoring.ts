import type { GuessState } from "@/lib/types";


/** Overview of the scoring logic 
 * Exact matched are scored first 
 * Misplaced phonemes are then scored 
 */

export function scoreGuess(
    guess: readonly string[],
    targetPhoneme: readonly string[],
): GuessState[] {
    if (guess.length !== targetPhoneme.length) {
        throw new Error(
            "A Wordle guess must contain the same number of phonemes as the target.",
        );
    }

    const results: GuessState[] = Array.from(
        { length: guess.length },
        () => "absent",
    );

    const remainingTargetPhoneme: Array<string | null> = [...targetPhoneme];

    // first pass: score exact pos matches
    guess.forEach((phonemeId, position) => {
        if (phonemeId === targetPhoneme[position]) {
            results[position] = "correct";
            remainingTargetPhoneme[position] = null;
        }
    });

    // second pass: score misplaced matches using unsused entries 
    guess.forEach((phonemeId, position) => {
        if (results[position] === "correct") {
            return;
        }

        const matchingTargetPhonemePosition =
            remainingTargetPhoneme.indexOf(phonemeId);

        if (matchingTargetPhonemePosition !== -1) {
            results[position] = "present";
            remainingTargetPhoneme[matchingTargetPhonemePosition] = null;
        }
    });

    return results;
}

// Change the colour of the phoneme key/character options the user can select based on correctness 
// A phoneme character must not change from correct back to present or absent
const GUESS_STATE_STRENGTH: Readonly<Record<GuessState, number>> = {
    absent: 1,
    present: 2,
    correct: 3,
};

function getStrongerGuessState(
    existingState: GuessState | undefined,
    newState: GuessState,
): GuessState {
    if (existingState === undefined) {
        return newState;
    }

    return GUESS_STATE_STRENGTH[newState] >
        GUESS_STATE_STRENGTH[existingState]
        ? newState
        : existingState;
}

//Builds the strongest known result for every previously guessed phoneme.
export function getPhonemeGuessStates(
    submittedGuesses: readonly (readonly string[])[],
    target: readonly string[],
): Partial<Record<string, GuessState>> {
    const phonemeGuessStates: Partial<Record<string, GuessState>> = {};

    submittedGuesses.forEach((guess) => {
        const score = scoreGuess(guess, target);

        guess.forEach((phonemeId, position) => {
            const newState = score[position];
            const existingState = phonemeGuessStates[phonemeId];

            phonemeGuessStates[phonemeId] = getStrongerGuessState(
                existingState,
                newState,
            );
        });
    });

    return phonemeGuessStates;
}