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