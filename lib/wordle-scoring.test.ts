import {
    describe,
    expect,
    it,
} from "vitest";

import {
    getPhonemeGuessStates,
    scoreGuess,
} from "@/lib/wordle-scoring";

 // TLDR: these tests makes sure a word which contains only one instance of a character, only rewards the correct pos of the char 
    // e.g. one 'a' character, only one guessed 'a' can receive credit. 
 //  The exact first-position match of a given char is consumed before checking misplaced phonemes
 // A guess must contain exactly the same number of phonemes as the target

describe("Wordle scoring", () => {
    it("scores duplicate phonemes only as often as they occur", () => {
        expect(
            scoreGuess(
                ["a", "a", "a"],
                ["a", "b", "c"],
            ),
        ).toEqual([
            "correct",
            "absent",
            "absent",
        ]);
    });

    it("scores exact matches before misplaced matches", () => {
        expect(
            scoreGuess(
                ["a", "b", "a"],
                ["a", "a", "b"],
            ),
        ).toEqual([
            "correct",
            "present",
            "present",
        ]);
    });

    it("rejects guesses with the wrong length", () => {
        expect(() =>
            scoreGuess(["a"], ["a", "b"]),
        ).toThrow(
            "same number of phonemes",
        );
    });

    it("keeps the strongest known keyboard state", () => {
        expect(
            getPhonemeGuessStates(
                [
                    ["a", "x"],
                    ["x", "a"],
                ],
                ["a", "x"],
            ),
        ).toEqual({
            a: "correct",
            x: "correct",
        });
    });
});