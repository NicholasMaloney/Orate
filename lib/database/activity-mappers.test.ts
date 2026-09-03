import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createCanonicalPhonemeId,
    InvalidActivityContentError,
    mapWordListRecordToActivityData,
    mapWordRecordToActivityData,
    type ActivityWordRecord,
} from "@/lib/database/activity-mappers";

const CHIN_RECORD = {
    id: "word-chin",
    english: "chin",
    ipa: "/tʃɪn/",
    phonemes: [
        {
            id: "occurrence-n",
            position: 2,
            ipaSymbol: "n",
            grapheme: "N",
            exampleWord: "net",
            spokenName: "n",
        },
        {
            id: "occurrence-ch",
            position: 0,
            ipaSymbol: "tʃ",
            grapheme: "CH",
            exampleWord: "chin",
            spokenName: "ch",
        },
        {
            id: "occurrence-short-i",
            position: 1,
            ipaSymbol: "ɪ",
            grapheme: "I",
            exampleWord: "sit",
            spokenName: "short i",
        },
    ],
} satisfies ActivityWordRecord;

interface SinglePhonemeWordOptions {
    readonly id: string;
    readonly ipaSymbol: string;
    readonly grapheme: string;
    readonly exampleWord: string;
    readonly spokenName: string;
}

function createSinglePhonemeWord({
    id,
    ipaSymbol,
    grapheme,
    exampleWord,
    spokenName,
}: SinglePhonemeWordOptions): ActivityWordRecord {
    return {
        id,
        english: id,
        ipa: `/${ipaSymbol}/`,
        phonemes: [
            {
                id: `occurrence-${id}`,
                position: 0,
                ipaSymbol,
                grapheme,
                exampleWord,
                spokenName,
            },
        ],
    };
}

describe("database activity mappers", () => {
    it("creates stable IDs from normalized code points", () => {
        expect(
            createCanonicalPhonemeId("ɪ"),
        ).toBe("ipa-26a");

        expect(
            createCanonicalPhonemeId("tʃ"),
        ).toBe("ipa-74-283");

        expect(
            createCanonicalPhonemeId(
                " a\u0303 ",
            ),
        ).toBe("ipa-e3");

        expect(
            createCanonicalPhonemeId("tʃ"),
        ).not.toBe(
            createCanonicalPhonemeId("t͡ʃ"),
        );
    });

    it("maps phonemes in position order without mutating the source", () => {
        const result =
            mapWordRecordToActivityData(
                CHIN_RECORD,
            );

        expect(result.word).toEqual({
            id: "word-chin",
            english: "chin",
            ipa: "/tʃɪn/",
            phonemeIds: [
                "ipa-74-283",
                "ipa-26a",
                "ipa-6e",
            ],
        });

        expect(
            result.phonemes.map(
                ({ id }) => id,
            ),
        ).toEqual([
            "ipa-26a",
            "ipa-6e",
            "ipa-74-283",
        ]);

        expect(
            CHIN_RECORD.phonemes.map(
                ({ position }) => position,
            ),
        ).toEqual([
            2,
            0,
            1,
        ]);
    });

    it("preserves repeated word IDs but deduplicates the bank", () => {
        const repeatedPhoneme =
            CHIN_RECORD.phonemes[1];

        const result =
            mapWordRecordToActivityData({
                id: "word-chch",
                english: "ch-ch",
                ipa: "/tʃtʃ/",
                phonemes: [
                    {
                        ...repeatedPhoneme,
                        id: "occurrence-first",
                        position: 0,
                    },
                    {
                        ...repeatedPhoneme,
                        id: "occurrence-second",
                        position: 1,
                    },
                ],
            });

        expect(result.word.phonemeIds).toEqual([
            "ipa-74-283",
            "ipa-74-283",
        ]);

        expect(result.phonemes).toHaveLength(1);
        expect(result.phonemes[0].id).toBe(
            "ipa-74-283",
        );
    });

    it("deduplicates NFC-equivalent symbols deterministically", () => {
        const laterMetadata =
            createSinglePhonemeWord({
                id: "word-later",
                ipaSymbol: "a\u0303",
                grapheme: "Z",
                exampleWord: "zebra",
                spokenName: "last",
            });

        const earlierMetadata =
            createSinglePhonemeWord({
                id: "word-earlier",
                ipaSymbol: "ã",
                grapheme: "A",
                exampleWord: "anchor",
                spokenName: "first",
            });

        const forward =
            mapWordListRecordToActivityData({
                id: "list-nasal",
                name: "Nasal words",
                description: null,
                words: [
                    laterMetadata,
                    earlierMetadata,
                ],
            });

        const reversed =
            mapWordListRecordToActivityData({
                id: "list-nasal",
                name: "Nasal words",
                description: null,
                words: [
                    earlierMetadata,
                    laterMetadata,
                ],
            });

        expect(
            forward.words.map(
                ({ phonemeIds }) =>
                    phonemeIds[0],
            ),
        ).toEqual([
            "ipa-e3",
            "ipa-e3",
        ]);

        expect(forward.phonemes).toEqual([
            {
                id: "ipa-e3",
                ipaSymbol: "ã",
                grapheme: "A",
                exampleWord: "anchor",
                spokenName: "first",
            },
        ]);

        expect(reversed.phonemes).toEqual(
            forward.phonemes,
        );
    });

    it("rejects a word without phoneme content", () => {
        expect(() =>
            mapWordRecordToActivityData({
                ...CHIN_RECORD,
                phonemes: [],
            }),
        ).toThrow(
            InvalidActivityContentError,
        );
    });

    it("rejects gaps in phoneme positions", () => {
        expect(() =>
            mapWordRecordToActivityData({
                ...CHIN_RECORD,
                phonemes: [
                    CHIN_RECORD.phonemes[0],
                    CHIN_RECORD.phonemes[1],
                ],
            }),
        ).toThrow(
            'Word "chin" must use consecutive phoneme positions starting at zero.',
        );
    });

    it("rejects empty normalized IPA content", () => {
        expect(() =>
            mapWordRecordToActivityData({
                ...CHIN_RECORD,
                ipa: "///",
            }),
        ).toThrow(
            'Word "chin" has no IPA transcription.',
        );

        expect(() =>
            mapWordRecordToActivityData({
                ...CHIN_RECORD,
                phonemes: [
                    {
                        ...CHIN_RECORD.phonemes[1],
                        ipaSymbol: " /// ",
                    },
                ],
            }),
        ).toThrow(
            "An activity phoneme must contain an IPA symbol.",
        );
    });

    it("accepts an empty word list", () => {
        expect(
            mapWordListRecordToActivityData({
                id: "list-empty",
                name: "Empty list",
                description: null,
                words: [],
            }),
        ).toEqual({
            id: "list-empty",
            name: "Empty list",
            description: null,
            words: [],
            phonemes: [],
        });
    });
});