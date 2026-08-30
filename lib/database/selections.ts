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