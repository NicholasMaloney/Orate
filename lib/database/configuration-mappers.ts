import { ActivityDifficulty, type Prisma } from "@/build/generated/prisma/client";
import { WORDLE_CONFIGURATION_SELECT,WORD_SEARCH_CONFIGURATION_SELECT } from "@/lib/database/selections";
import type {
    Difficulty,
    WordleConfigurationRecord,
    WordSearchConfigurationRecord,
} from "@/lib/types";

// Runtime values suit forms and generated activities.
const RUNTIME_TO_DATABASE = {
    easy: ActivityDifficulty.EASY,
    standard: ActivityDifficulty.STANDARD,
    challenging: ActivityDifficulty.CHALLENGING,
} satisfies Readonly<
    Record<Difficulty, ActivityDifficulty>
>;

// Database values remain explicit and constrained by Prisma.
const DATABASE_TO_RUNTIME = {
    [ActivityDifficulty.EASY]: "easy",
    [ActivityDifficulty.STANDARD]: "standard",
    [ActivityDifficulty.CHALLENGING]:
        "challenging",
} satisfies Readonly<
    Record<ActivityDifficulty, Difficulty>
>;

type WordleRecord =
    Prisma.WordleConfigurationGetPayload<{
        select:
            typeof WORDLE_CONFIGURATION_SELECT;
    }>;

type WordSearchRecord =
    Prisma.WordSearchConfigurationGetPayload<{
        select:
            typeof WORD_SEARCH_CONFIGURATION_SELECT;
    }>;

// Converts validated public input before a Prisma write.
export function toDatabaseDifficulty(
    difficulty: Difficulty,
): ActivityDifficulty {
    return RUNTIME_TO_DATABASE[difficulty];
}

// Converts persisted values before sending public JSON.
export function toRuntimeDifficulty(
    difficulty: ActivityDifficulty,
): Difficulty {
    return DATABASE_TO_RUNTIME[difficulty];
}

export function mapWordleConfiguration(
    record: WordleRecord,
): WordleConfigurationRecord {
    return {
        id: record.id,
        name: record.name,
        wordId: record.wordId,
        difficulty:
            toRuntimeDifficulty(
                record.difficulty,
            ),
        hintsEnabled: record.hintsEnabled,
        createdAt:
            record.createdAt.toISOString(),
        updatedAt:
            record.updatedAt.toISOString(),
        word: record.word,
    };
}

export function mapWordSearchConfiguration(
    record: WordSearchRecord,
): WordSearchConfigurationRecord {
    const { _count, ...wordList } =
        record.wordList;

    return {
        id: record.id,
        name: record.name,
        wordListId: record.wordListId,
        difficulty:
            toRuntimeDifficulty(
                record.difficulty,
            ),
        seed: record.seed,
        hintsEnabled: record.hintsEnabled,
        createdAt:
            record.createdAt.toISOString(),
        updatedAt:
            record.updatedAt.toISOString(),
        wordList: {
            ...wordList,
            wordCount: _count.words,
        },
    };
}