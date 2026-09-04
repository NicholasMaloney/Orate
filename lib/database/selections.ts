import type { Prisma } from "@/build/generated/prisma/client";

// Selects the public word fields and orders its phonemes for activity use.
export const WORD_WITH_PHONEMES_SELECT = {
    id: true,
    wordListId: true,
    english: true,
    ipa: true,
    createdAt: true,
    updatedAt: true,
    phonemes: {
        orderBy: {
            position: "asc",
        },
        select: {
            id: true,
            position: true,
            ipaSymbol: true,
            grapheme: true,
            exampleWord: true,
            spokenName: true,
        },
    },
} satisfies Prisma.WordSelect;

// Loads a saved Wordle and the target's parent-list identity.
export const WORDLE_CONFIGURATION_SELECT = {
    id: true,
    name: true,
    wordId: true,
    difficulty: true,
    hintsEnabled: true,
    createdAt: true,
    updatedAt: true,
    word: {
        select: {
            id: true,
            wordListId: true,
            english: true,
            ipa: true,
        },
    },
} satisfies Prisma.WordleConfigurationSelect;

// Loads a saved Word Search with display information about its list.
export const WORD_SEARCH_CONFIGURATION_SELECT = {
    id: true,
    name: true,
    wordListId: true,
    difficulty: true,
    seed: true,
    hintsEnabled: true,
    createdAt: true,
    updatedAt: true,
    wordList: {
        select: {
            id: true,
            name: true,
            description: true,
            _count: {
                select: {
                    words: true,
                },
            },
        },
    },
} satisfies Prisma.WordSearchConfigurationSelect;