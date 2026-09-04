import { describe, expect, it } from "vitest";
import { PHONEMES } from "@/lib/phoneme-definitions";
import { getWordleWord, WORD_SEARCH_WORDS } from "@/lib/phonemes";
import { buildStandaloneWordleHtml, buildStandaloneWordSearchHtml } from "@/lib/standalone";
import type {
    WordleActivityContent,
    WordleConfig,
    WordSearchActivityContent,
    WordSearchConfig,
} from "@/lib/types";

// Stable configurations keep these tests focused on theme output.
const WORDLE_CONFIG: WordleConfig = {
    wordId: "thin",
    difficulty: "standard",
    hintsEnabled: true,
};

const WORD_SEARCH_CONFIG: WordSearchConfig = {
    difficulty: "standard",
    seed: 260724,
    hintsEnabled: true,
};

// Static fixtures keep theme tests independent from the database.
const WORDLE_CONTENT = {
    selectedWord: getWordleWord(
        WORDLE_CONFIG.wordId,
    ),
    phonemes: PHONEMES,
} satisfies WordleActivityContent;

const WORD_SEARCH_CONTENT = {
    words: WORD_SEARCH_WORDS,
    phonemes: PHONEMES,
} satisfies WordSearchActivityContent;

describe("standalone activity themes", () => {
    it.each([
        "light",
        "dark",
    ] as const)(
        "embeds the resolved %s theme in Wordle",
        (theme) => {
            const html =
                buildStandaloneWordleHtml(
                    WORDLE_CONFIG,
                    WORDLE_CONTENT,
                    theme,
                );

            expect(html).toContain(
                `<html lang="en" data-theme="${theme}">`,
            );

            expect(html).toContain(
                `<meta name="color-scheme" content="${theme}">`,
            );
        },
    );

    it.each([
        "light",
        "dark",
    ] as const)(
        "embeds the resolved %s theme in Word Search",
        (theme) => {
            const html =
                buildStandaloneWordSearchHtml(
                    WORD_SEARCH_CONFIG,
                    WORD_SEARCH_CONTENT,
                    theme,
                );

            expect(html).toContain(
                `<html lang="en" data-theme="${theme}">`,
            );

            expect(html).toContain(
                `<meta name="color-scheme" content="${theme}">`,
            );
        },
    );
});