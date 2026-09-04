import {
    describe,
    expect,
    it,
} from "vitest";

import {
    mapWordleConfiguration,
    mapWordSearchConfiguration,
    toDatabaseDifficulty,
    toRuntimeDifficulty,
} from "@/lib/database/configuration-mappers";

import { ActivityDifficulty } from "@/build/generated/prisma/client";

const CREATED_AT =
    new Date("2026-07-24T01:02:03.000Z");

const UPDATED_AT =
    new Date("2026-07-25T04:05:06.000Z");

describe("configuration mappers", () => {
    it.each([
        [
            ActivityDifficulty.EASY,
            "easy",
        ],
        [
            ActivityDifficulty.STANDARD,
            "standard",
        ],
        [
            ActivityDifficulty.CHALLENGING,
            "challenging",
        ],
    ] as const)(
        "maps database difficulty %s to runtime value %s",
        (
            databaseDifficulty,
            runtimeDifficulty,
        ) => {
            expect(
                toRuntimeDifficulty(
                    databaseDifficulty,
                ),
            ).toBe(runtimeDifficulty);

            expect(
                toDatabaseDifficulty(
                    runtimeDifficulty,
                ),
            ).toBe(databaseDifficulty);
        },
    );

    it("maps a Wordle record to public JSON", () => {
        const result =
            mapWordleConfiguration({
                id: "wordle-configuration",
                name: "Short vowels",
                wordId: "word-thin",
                difficulty:
                    ActivityDifficulty.CHALLENGING,
                hintsEnabled: false,
                createdAt: CREATED_AT,
                updatedAt: UPDATED_AT,
                word: {
                    id: "word-thin",
                    wordListId:
                        "list-classroom",
                    english: "thin",
                    ipa: "/θɪn/",
                },
            });

        expect(result).toEqual({
            id: "wordle-configuration",
            name: "Short vowels",
            wordId: "word-thin",
            difficulty: "challenging",
            hintsEnabled: false,
            createdAt:
                "2026-07-24T01:02:03.000Z",
            updatedAt:
                "2026-07-25T04:05:06.000Z",
            word: {
                id: "word-thin",
                wordListId:
                    "list-classroom",
                english: "thin",
                ipa: "/θɪn/",
            },
        });
    });

    it("maps a Word Search record to public JSON", () => {
        const result =
            mapWordSearchConfiguration({
                id: "search-configuration",
                name: "Term two revision",
                wordListId:
                    "list-classroom",
                difficulty:
                    ActivityDifficulty.STANDARD,
                seed: 260724,
                hintsEnabled: true,
                createdAt: CREATED_AT,
                updatedAt: UPDATED_AT,
                wordList: {
                    id: "list-classroom",
                    name: "Classroom words",
                    description:
                        "Term two content",
                    _count: {
                        words: 12,
                    },
                },
            });

        expect(result).toEqual({
            id: "search-configuration",
            name: "Term two revision",
            wordListId:
                "list-classroom",
            difficulty: "standard",
            seed: 260724,
            hintsEnabled: true,
            createdAt:
                "2026-07-24T01:02:03.000Z",
            updatedAt:
                "2026-07-25T04:05:06.000Z",
            wordList: {
                id: "list-classroom",
                name: "Classroom words",
                description:
                    "Term two content",
                wordCount: 12,
            },
        });
    });
});