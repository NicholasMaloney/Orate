import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { normaliseIpaSymbol, normaliseIpaTranscription, } from "../lib/ipa";
import {
    ActivityType,
    GenerationOutcome,
    MetricSource,
    PrismaClient,
    type Prisma,
} from "../build/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
}

// Connects the generated Prisma Client to PostgreSQL.
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Reusable speech-sound details copied from Orate's current activity data.
const PHONEMES = {
    theta: {
        ipaSymbol: "θ",
        grapheme: "TH",
        exampleWord: "thin",
        spokenName: "voiceless th",
    },
    shortI: {
        ipaSymbol: "ɪ",
        grapheme: "I",
        exampleWord: "sit",
        spokenName: "short i",
    },
    n: {
        ipaSymbol: "n",
        grapheme: "N",
        exampleWord: "net",
        spokenName: "n",
    },
    sh: {
        ipaSymbol: "ʃ",
        grapheme: "SH",
        exampleWord: "ship",
        spokenName: "sh",
    },
    p: {
        ipaSymbol: "p",
        grapheme: "P",
        exampleWord: "pen",
        spokenName: "p",
    },
    ch: {
        ipaSymbol: "tʃ",
        grapheme: "CH",
        exampleWord: "chin",
        spokenName: "ch",
    },
    j: {
        ipaSymbol: "dʒ",
        grapheme: "J",
        exampleWord: "jam",
        spokenName: "j",
    },
    shortA: {
        ipaSymbol: "æ",
        grapheme: "A",
        exampleWord: "cat",
        spokenName: "short a",
    },
    m: {
        ipaSymbol: "m",
        grapheme: "M",
        exampleWord: "map",
        spokenName: "m",
    },
    f: {
        ipaSymbol: "f",
        grapheme: "F",
        exampleWord: "fan",
        spokenName: "f",
    },
} as const;

// These are the existing Orate words with complete ordered phoneme data.
const STARTER_WORDS = [
    {
        english: "thin",
        ipa: "/θɪn/",
        phonemes: [
            PHONEMES.theta,
            PHONEMES.shortI,
            PHONEMES.n,
        ],
    },
    {
        english: "ship",
        ipa: "/ʃɪp/",
        phonemes: [
            PHONEMES.sh,
            PHONEMES.shortI,
            PHONEMES.p,
        ],
    },
    {
        english: "chin",
        ipa: "/tʃɪn/",
        phonemes: [
            PHONEMES.ch,
            PHONEMES.shortI,
            PHONEMES.n,
        ],
    },
    {
        english: "jam",
        ipa: "/dʒæm/",
        phonemes: [
            PHONEMES.j,
            PHONEMES.shortA,
            PHONEMES.m,
        ],
    },
    {
        english: "fan",
        ipa: "/fæn/",
        phonemes: [
            PHONEMES.f,
            PHONEMES.shortA,
            PHONEMES.n,
        ],
    },
] as const;

const STARTER_LIST = {
    name: "Orate Starter Words",
    description:
        "Starter phoneme words for Wordle and Word Search activities.",
} as const;

const SIMULATED_GENERATIONS:
    Prisma.ActivityGenerationCreateManyInput[] = [
        {
            id: "90000000-0000-4000-8000-000000000001",
            activityType: ActivityType.WORDLE,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-21T01:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000002",
            activityType: ActivityType.WORDLE,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-22T02:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000003",
            activityType: ActivityType.WORDLE,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-23T03:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000004",
            activityType: ActivityType.WORDLE,
            outcome: GenerationOutcome.FAILURE,
            source: MetricSource.SIMULATED,
            message:
                "The selected list did not contain a distractor phoneme.",
            createdAt: new Date(
                "2026-09-24T04:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000005",
            activityType:
                ActivityType.WORD_SEARCH,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-21T05:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000006",
            activityType:
                ActivityType.WORD_SEARCH,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-22T06:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000007",
            activityType:
                ActivityType.WORD_SEARCH,
            outcome: GenerationOutcome.SUCCESS,
            source: MetricSource.SIMULATED,
            message: null,
            createdAt: new Date(
                "2026-09-23T07:00:00.000Z",
            ),
        },
        {
            id: "90000000-0000-4000-8000-000000000008",
            activityType:
                ActivityType.WORD_SEARCH,
            outcome: GenerationOutcome.FAILURE,
            source: MetricSource.SIMULATED,
            message:
                "A word was longer than the selected grid size.",
            createdAt: new Date(
                "2026-09-24T08:00:00.000Z",
            ),
        },
    ];

const SIMULATED_PAGE_VIEWS:
    Prisma.PageViewCreateManyInput[] = [
        {
            id: "91000000-0000-4000-8000-000000000001",
            path: "/wordle",
            durationMs: 54_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-21T01:00:00.000Z",
            ),
        },
        {
            id: "91000000-0000-4000-8000-000000000002",
            path: "/wordle",
            durationMs: 72_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-22T02:00:00.000Z",
            ),
        },
        {
            id: "91000000-0000-4000-8000-000000000003",
            path: "/wordle",
            durationMs: 41_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-23T03:00:00.000Z",
            ),
        },
        {
            id: "91000000-0000-4000-8000-000000000004",
            path: "/word-search",
            durationMs: 81_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-21T05:00:00.000Z",
            ),
        },
        {
            id: "91000000-0000-4000-8000-000000000005",
            path: "/word-search",
            durationMs: 96_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-22T06:00:00.000Z",
            ),
        },
        {
            id: "91000000-0000-4000-8000-000000000006",
            path: "/word-search",
            durationMs: 63_000,
            source: MetricSource.SIMULATED,
            createdAt: new Date(
                "2026-09-23T07:00:00.000Z",
            ),
        },
    ];

async function seedStarterContent() {
    // The transaction prevents partially seeded content if an operation fails.
    return prisma.$transaction(async (database) => {
        const wordList = await database.wordList.upsert({
            where: {
                name: STARTER_LIST.name,
            },
            update: {
                description: STARTER_LIST.description,
            },
            create: STARTER_LIST,
        });

        for (const word of STARTER_WORDS) {
            // The compound unique key prevents duplicate words within the list.
            const storedWord = await database.word.upsert({
                where: {
                    wordListId_english: {
                        wordListId: wordList.id,
                        english: word.english,
                    },
                },
                update: {
                    ipa: normaliseIpaTranscription(word.ipa),
                },
                create: {
                    wordListId: wordList.id,
                    english: word.english,
                    ipa: normaliseIpaTranscription(word.ipa),
                },
            });

            // Replaces the token sequence so positions always match the seed data.
            await database.wordPhoneme.deleteMany({
                where: {
                    wordId: storedWord.id,
                },
            });

            await database.wordPhoneme.createMany({
                data: word.phonemes.map((phoneme, position) => ({
                    wordId: storedWord.id,
                    position,
                    ...phoneme,
                    ipaSymbol: normaliseIpaSymbol(
                        phoneme.ipaSymbol,
                    ),
                })),
            });
        }

        // Replaces / deletes only simulated metrics while preserving live records.
        await database.activityGeneration.deleteMany({
            where: {
                source: MetricSource.SIMULATED,
            },
        });

        await database.pageView.deleteMany({
            where: {
                source: MetricSource.SIMULATED,
            },
        });

        await database.activityGeneration.createMany({
            data: SIMULATED_GENERATIONS,
        });

        await database.pageView.createMany({
            data: SIMULATED_PAGE_VIEWS,
        });


        return {
            listName: wordList.name,
            wordCount: STARTER_WORDS.length,
            simulatedGenerationCount:
                SIMULATED_GENERATIONS.length,
            simulatedPageViewCount:
                SIMULATED_PAGE_VIEWS.length,
        };
    });
}

seedStarterContent()
    .then(
        ({
            listName,
            wordCount,
            simulatedGenerationCount,
            simulatedPageViewCount,
        }) => {
            console.log(
                `Seeded "${listName}" with ${wordCount} words, `+
                    `${simulatedGenerationCount} simulated generation records, ` + 
                    ` and ${simulatedPageViewCount} simulated page-view records.`,
            );
        },
    )
    .catch((error: unknown) => {
        console.error(
            "Unable to seed Orate's starter content and simulated metrics.",
            error,
        );
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });