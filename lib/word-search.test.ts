import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    WordSearchActivityContent,
    WordSearchConfig,
} from "@/lib/types";
import {
    generateWordSearch,
    WordSearchGenerationError,
} from "@/lib/word-search";

// Local content proves the generator has no static-data fallback.
const CONTENT = {
    words: [
        {
            id: "thin",
            english: "thin",
            ipa: "/θɪn/",
            phonemeIds: [
                "theta",
                "short-i",
                "n",
            ],
        },
        {
            id: "ship",
            english: "ship",
            ipa: "/ʃɪp/",
            phonemeIds: [
                "sh",
                "short-i",
                "p",
            ],
        },
        {
            id: "chin",
            english: "chin",
            ipa: "/tʃɪn/",
            phonemeIds: [
                "ch",
                "short-i",
                "n",
            ],
        },
    ],
    phonemes: [
        {
            id: "theta",
            ipaSymbol: "θ",
            grapheme: "TH",
            exampleWord: "thin",
            spokenName: "voiceless th",
        },
        {
            id: "short-i",
            ipaSymbol: "ɪ",
            grapheme: "I",
            exampleWord: "sit",
            spokenName: "short i",
        },
        {
            id: "n",
            ipaSymbol: "n",
            grapheme: "N",
            exampleWord: "net",
            spokenName: "n",
        },
        {
            id: "sh",
            ipaSymbol: "ʃ",
            grapheme: "SH",
            exampleWord: "ship",
            spokenName: "sh",
        },
        {
            id: "p",
            ipaSymbol: "p",
            grapheme: "P",
            exampleWord: "pen",
            spokenName: "p",
        },
        {
            id: "ch",
            ipaSymbol: "tʃ",
            grapheme: "CH",
            exampleWord: "chin",
            spokenName: "ch",
        },
    ],
} satisfies WordSearchActivityContent;

const CONFIG = {
    difficulty: "standard",
    seed: 260724,
    hintsEnabled: true,
} satisfies WordSearchConfig;

function createDenseContent():
    WordSearchActivityContent {
    const phonemes = Array.from(
        { length: 65 },
        (_, index) => ({
            id: `phoneme-${index}`,
            ipaSymbol: String(index),
            grapheme: String(index),
            exampleWord: `example-${index}`,
            spokenName: `sound-${index}`,
        }),
    );

    return {
        phonemes,

        // Distinct IDs cannot overlap, so 65 cells cannot fit in 8 × 8.
        words: phonemes.map(
            (phoneme, index) => ({
                id: `word-${index}`,
                english: `word-${index}`,
                ipa: `/${phoneme.ipaSymbol}/`,
                phonemeIds: [phoneme.id],
            }),
        ),
    };
}

describe("generateWordSearch", () => {
    it("is deterministic for equal configuration and content", () => {
        const firstPuzzle =
            generateWordSearch(
                CONFIG,
                CONTENT,
            );

        const secondPuzzle =
            generateWordSearch(
                CONFIG,
                CONTENT,
            );

        expect(firstPuzzle).toEqual(
            secondPuzzle,
        );

        expect(firstPuzzle.seed).toBe(
            CONFIG.seed,
        );
    });

    it.each([
        ["easy", 8],
        ["standard", 10],
        ["challenging", 12],
    ] as const)(
        "creates a %s grid with the expected dimensions",
        (difficulty, size) => {
            const puzzle =
                generateWordSearch(
                    {
                        ...CONFIG,
                        difficulty,
                    },
                    CONTENT,
                );

            expect(puzzle.grid).toHaveLength(
                size,
            );

            expect(
                puzzle.grid.every(
                    (row) =>
                        row.length === size,
                ),
            ).toBe(true);
        },
    );

    it("places and spells every word inside the grid", () => {
        const puzzle =
            generateWordSearch(
                CONFIG,
                CONTENT,
            );

        const wordsById = new Map(
            CONTENT.words.map(
                (word) =>
                    [word.id, word] as const,
            ),
        );

        const placementIds =
            puzzle.placements.map(
                ({ wordId }) => wordId,
            );

        expect(
            [...placementIds].sort(),
        ).toEqual(
            CONTENT.words
                .map(({ id }) => id)
                .sort(),
        );

        expect(
            new Set(placementIds).size,
        ).toBe(CONTENT.words.length);

        // Placement coordinates act as the puzzle's answer key.
        for (const placement of puzzle.placements) {
            const word =
                wordsById.get(
                    placement.wordId,
                );

            expect(word).toBeDefined();

            if (!word) {
                throw new Error(
                    "Placement used an unknown word.",
                );
            }

            const placedPhonemeIds =
                placement.coordinates.map(
                    ({ row, column }) => {
                        expect(row)
                            .toBeGreaterThanOrEqual(0);
                        expect(row)
                            .toBeLessThan(
                                puzzle.grid.length,
                            );
                        expect(column)
                            .toBeGreaterThanOrEqual(0);
                        expect(column)
                            .toBeLessThan(
                                puzzle.grid.length,
                            );

                        return puzzle.grid[
                            row
                        ][column];
                    },
                );

            expect(
                placedPhonemeIds,
            ).toEqual(word.phonemeIds);
        }

        // Filler must also come from the supplied phoneme bank.
        const allowedPhonemeIds = new Set(
            CONTENT.phonemes.map(
                ({ id }) => id,
            ),
        );

        expect(
            puzzle.grid
                .flat()
                .every((phonemeId) =>
                    allowedPhonemeIds.has(
                        phonemeId,
                    ),
                ),
        ).toBe(true);
    });

    it("rejects an unknown phoneme reference", () => {
        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    ...CONTENT,
                    words: [
                        {
                            ...CONTENT.words[0],
                            phonemeIds: [
                                "missing",
                            ],
                        },
                    ],
                },
            ),
        ).toThrow(
            'Word "thin" uses unknown phoneme "missing".',
        );
    });

    it("rejects duplicate phoneme and word IDs", () => {
        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    ...CONTENT,
                    phonemes: [
                        ...CONTENT.phonemes,
                        CONTENT.phonemes[0],
                    ],
                },
            ),
        ).toThrow(
            "Duplicate phoneme ID: theta.",
        );

        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    ...CONTENT,
                    words: [
                        ...CONTENT.words,
                        CONTENT.words[0],
                    ],
                },
            ),
        ).toThrow(
            "Duplicate word ID: thin.",
        );
    });

    it("rejects empty activity content", () => {
        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    words: [],
                    phonemes:
                        CONTENT.phonemes,
                },
            ),
        ).toThrow(
            "Word Search requires at least one word.",
        );

        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    words: CONTENT.words,
                    phonemes: [],
                },
            ),
        ).toThrow(
            "Word Search requires at least one phoneme.",
        );
    });

    it("rejects words without phonemes or longer than the grid", () => {
        expect(() =>
            generateWordSearch(
                CONFIG,
                {
                    ...CONTENT,
                    words: [
                        {
                            ...CONTENT.words[0],
                            phonemeIds: [],
                        },
                    ],
                },
            ),
        ).toThrow(
            'Word "thin" has no phonemes.',
        );

        expect(() =>
            generateWordSearch(
                {
                    ...CONFIG,
                    difficulty: "easy",
                },
                {
                    ...CONTENT,
                    words: [
                        {
                            ...CONTENT.words[0],
                            phonemeIds:
                                Array.from(
                                    { length: 9 },
                                    () => "theta",
                                ),
                        },
                    ],
                },
            ),
        ).toThrow(
            'Word "thin" is too long for this grid.',
        );
    });

    it("returns an actionable typed error for unplaceable content", () => {
        const generate = () =>
            generateWordSearch(
                {
                    ...CONFIG,
                    difficulty: "easy",
                },
                createDenseContent(),
            );

        expect(generate).toThrow(
            WordSearchGenerationError,
        );

        expect(generate).toThrow(
            "Use fewer or shorter words",
        );
    });
});