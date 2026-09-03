import type {
    Word as DatabaseWord,
    WordList as DatabaseWordList,
    WordPhoneme as DatabaseWordPhoneme,
} from "@/build/generated/prisma/client";

import {
    normaliseIpaSymbol,
    normaliseIpaTranscription,
} from "@/lib/ipa";
import type {
    ActivityWordListData,
    CompletePhonemeWord,
    Phoneme,
} from "@/lib/types";

// Lets API routes distinguish invalid content from server failures.
export class InvalidActivityContentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidActivityContentError";
    }
}

export type ActivityPhonemeRecord = Pick<
    DatabaseWordPhoneme,
    | "id"
    | "position"
    | "ipaSymbol"
    | "grapheme"
    | "exampleWord"
    | "spokenName"
>;

export type ActivityWordRecord = Pick<
    DatabaseWord,
    "id" | "english" | "ipa"
> & {
    readonly phonemes:
        readonly ActivityPhonemeRecord[];
};

export type ActivityWordListRecord = Pick<
    DatabaseWordList,
    "id" | "name" | "description"
> & {
    readonly words: readonly ActivityWordRecord[];
};

export interface ActivityWordData {
    readonly word: CompletePhonemeWord;
    readonly phonemes: readonly Phoneme[];
}

function normaliseStoredPhonemeSymbol(
    value: string,
): string {
    const normalised = normaliseIpaSymbol(value);

    if (!normalised) {
        throw new InvalidActivityContentError(
            "An activity phoneme must contain an IPA symbol.",
        );
    }

    return normalised;
}

// Activity identity is derived from normalised Unicode code points.
export function createCanonicalPhonemeId(
    ipaSymbol: string,
): string {
    const normalised =
        normaliseStoredPhonemeSymbol(ipaSymbol);

    const codePoints = Array
        .from(normalised)
        .map((symbol) =>
            symbol.codePointAt(0)!.toString(16),
        )
        .join("-");

    return `ipa-${codePoints}`;
}

// Ordinal comparison remains stable across locales.
function compareText(
    first: string,
    second: string,
): number {
    return first < second
        ? -1
        : first > second
            ? 1
            : 0;
}

function comparePhonemeMetadata(
    first: Phoneme,
    second: Phoneme,
): number {
    return (
        compareText(
            first.grapheme,
            second.grapheme,
        ) ||
        compareText(
            first.exampleWord,
            second.exampleWord,
        ) ||
        compareText(
            first.spokenName,
            second.spokenName,
        )
    );
}

function mapPhoneme(
    record: ActivityPhonemeRecord,
): Phoneme {
    const ipaSymbol =
        normaliseStoredPhonemeSymbol(
            record.ipaSymbol,
        );

    return {
        id: createCanonicalPhonemeId(ipaSymbol),
        ipaSymbol,
        grapheme: record.grapheme,
        exampleWord: record.exampleWord,
        spokenName: record.spokenName,
    };
}

function orderedPhonemes(
    word: ActivityWordRecord,
): readonly ActivityPhonemeRecord[] {
    const records = [...word.phonemes].sort(
        (first, second) =>
            first.position - second.position,
    );

    if (records.length === 0) {
        throw new InvalidActivityContentError(
            `Word "${word.english}" contains no phonemes.`,
        );
    }

    records.forEach(
        (record, expectedPosition) => {
            if (
                record.position !==
                expectedPosition
            ) {
                throw new InvalidActivityContentError(
                    `Word "${word.english}" must use consecutive phoneme positions starting at zero.`,
                );
            }
        },
    );

    return records;
}

function deduplicatePhonemes(
    phonemes: readonly Phoneme[],
): readonly Phoneme[] {
    const phonemesById =
        new Map<string, Phoneme>();

    for (const phoneme of phonemes) {
        const existing =
            phonemesById.get(phoneme.id);

        if (
            !existing ||
            comparePhonemeMetadata(
                phoneme,
                existing,
            ) < 0
        ) {
            phonemesById.set(
                phoneme.id,
                phoneme,
            );
        }
    }

    return [...phonemesById.values()].sort(
        (first, second) =>
            compareText(first.id, second.id),
    );
}

export function mapWordRecordToActivityData(
    word: ActivityWordRecord,
): ActivityWordData {
    const phonemes =
        orderedPhonemes(word).map(mapPhoneme);

    const ipa =
        normaliseIpaTranscription(word.ipa);

    if (!ipa) {
        throw new InvalidActivityContentError(
            `Word "${word.english}" has no IPA transcription.`,
        );
    }

    return {
        word: {
            id: word.id,
            english: word.english,
            ipa,
            phonemeIds: phonemes.map(
                ({ id }) => id,
            ),
        },
        phonemes:
            deduplicatePhonemes(phonemes),
    };
}

export function mapWordListRecordToActivityData(
    wordList: ActivityWordListRecord,
): ActivityWordListData {
    const mappedWords = wordList.words.map(
        mapWordRecordToActivityData,
    );

    return {
        id: wordList.id,
        name: wordList.name,
        description: wordList.description,
        words: mappedWords.map(
            ({ word }) => word,
        ),
        phonemes: deduplicatePhonemes(
            mappedWords.flatMap(
                ({ phonemes }) => phonemes,
            ),
        ),
    };
}