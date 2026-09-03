import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../build/generated/prisma/client";
import { normaliseIpaSymbol,normaliseIpaTranscription, } from "../lib/ipa";

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
         

        return {
            listName: wordList.name,
            wordCount: STARTER_WORDS.length,
        };
    });
}

seedStarterContent()
    .then(({ listName, wordCount }) => {
        console.log(`Seeded "${listName}" with ${wordCount} words.`);
    })
    .catch((error: unknown) => {
        console.error("Unable to seed Orate's starter content.", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });