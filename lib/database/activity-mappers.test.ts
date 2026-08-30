import {
    describe,
    expect,
    it,
} from "vitest";

import {
    mapWordListRecordToActivityData,
    mapWordRecordToActivityData,
} from "@/lib/database/activity-mappers";
import type {
    ActivityWordRecord,
} from "@/lib/database/activity-mappers";

const CHIN_RECORD = {
    id: "word-chin",
    english: "chin",
    ipa: "/tʃɪn/",
    phonemes: [
        {
            id: "phoneme-n",
            position: 2,
            ipaSymbol: "n",
            grapheme: "N",
            exampleWord: "net",
            spokenName: "n",
        },
        {
            id: "phoneme-ch",
            position: 0,
            ipaSymbol: "tʃ",
            grapheme: "CH",
            exampleWord: "chin",
            spokenName: "ch",
        },
        {
            id: "phoneme-short-i",
            position: 1,
            ipaSymbol: "ɪ",
            grapheme: "I",
            exampleWord: "sit",
            spokenName: "short i",
        },
    ],
} satisfies ActivityWordRecord;

describe("database activity mappers", () => {
    it("maps a database word in phoneme position order", () => {
        const result =
            mapWordRecordToActivityData(CHIN_RECORD);

        expect(result.word).toEqual({
            id: "word-chin",
            english: "chin",
            ipa: "/tʃɪn/",
            phonemeIds: [
                "phoneme-ch",
                "phoneme-short-i",
                "phoneme-n",
            ],
        });

        expect(
            result.phonemes.map(
                ({ ipaSymbol }) => ipaSymbol,
            ),
        ).toEqual([
            "tʃ",
            "ɪ",
            "n",
        ]);

        // Mapping must not rearrange the original Prisma result.
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

    it("maps a complete word list for activity use", () => {
        const result =
            mapWordListRecordToActivityData({
                id: "list-starter",
                name: "Orate Starter Words",
                description: "Starter speech content.",
                words: [CHIN_RECORD],
            });

        expect(result).toMatchObject({
            id: "list-starter",
            name: "Orate Starter Words",
            description: "Starter speech content.",
        });

        expect(result.words).toHaveLength(1);
        expect(result.phonemes).toHaveLength(3);
        expect(result.words[0].english).toBe("chin");
    });

    it("rejects a word without phoneme content", () => {
        expect(() =>
            mapWordRecordToActivityData({
                ...CHIN_RECORD,
                phonemes: [],
            }),
        ).toThrow(
            'Word "chin" does not contain any phonemes.',
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
});