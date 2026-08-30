import { Prisma } from "@/build/generated/prisma/client";
import type {
    ExpectedPrismaErrorCode,
} from "@/lib/database/errors";

export const LIST_ID =
    "11111111-1111-4111-8111-111111111111";

export const WORD_ID =
    "22222222-2222-4222-8222-222222222222";

const PHONEME_IDS = [
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
    "55555555-5555-4555-8555-555555555555",
] as const;

export const CREATED_AT =
    new Date("2026-08-30T01:00:00.000Z");

export const UPDATED_AT =
    new Date("2026-08-30T02:00:00.000Z");

export const WORD_INPUT = {
    english: "chin",
    ipa: "/tʃɪn/",
    phonemes: [
        {
            ipaSymbol: "tʃ",
            grapheme: "CH",
            exampleWord: "chin",
            spokenName: "ch",
        },
        {
            ipaSymbol: "ɪ",
            grapheme: "I",
            exampleWord: "sit",
            spokenName: "short i",
        },
        {
            ipaSymbol: "n",
            grapheme: "N",
            exampleWord: "net",
            spokenName: "n",
        },
    ],
} as const;

export const WORD_RECORD = {
    id: WORD_ID,
    wordListId: LIST_ID,
    english: WORD_INPUT.english,
    ipa: WORD_INPUT.ipa,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    phonemes: WORD_INPUT.phonemes.map(
        (phoneme, position) => ({
            id: PHONEME_IDS[position],
            position,
            ...phoneme,
        }),
    ),
};

export const WORD_LIST_RECORD = {
    id: LIST_ID,
    name: "Classroom words",
    description: null,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    _count: {
        words: 2,
    },
};

// Creates the Request objects passed directly to Route Handlers.
export function jsonRequest(
    path: string,
    method: string,
    body: unknown,
): Request {
    return new Request(
        `http://localhost${path}`,
        {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );
}

export function listContext(
    listId = LIST_ID,
) {
    return {
        params: Promise.resolve({
            listId,
        }),
    };
}

export function wordContext(
    wordId = WORD_ID,
) {
    return {
        params: Promise.resolve({
            wordId,
        }),
    };
}

// Produces the real Prisma error class used by instanceof checks.
export function prismaError(
    code: ExpectedPrismaErrorCode,
): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError(
        `Prisma test error ${code}`,
        {
            code,
            clientVersion: "7.10.0",
        },
    );
}