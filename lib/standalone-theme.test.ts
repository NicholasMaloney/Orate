import {
    describe,
    expect,
    it,
} from "vitest";

import {
    buildStandaloneWordleHtml,
    buildStandaloneWordSearchHtml,
} from "@/lib/standalone";
import type {
    WordleConfig,
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