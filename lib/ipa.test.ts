import {
    describe,
    expect,
    it,
} from "vitest";

import {
    normaliseIpaSymbol,
    normaliseIpaTranscription,
} from "@/lib/ipa";

describe("IPA normalization", () => {
    it.each([
        ["tʃɪn", "/tʃɪn/"],
        ["/tʃɪn/", "/tʃɪn/"],
        [" //tʃɪn// ", "/tʃɪn/"],
    ])(
        "normalizes complete transcription %s",
        (input, expected) => {
            expect(
                normaliseIpaTranscription(input),
            ).toBe(expected);
        },
    );

    it.each([
        ["tʃ", "tʃ"],
        ["/tʃ/", "tʃ"],
        [" //tʃ// ", "tʃ"],
    ])(
        "normalizes phoneme symbol %s",
        (input, expected) => {
            expect(
                normaliseIpaSymbol(input),
            ).toBe(expected);
        },
    );

    it("normalizes canonically equivalent Unicode", () => {
        expect(
            normaliseIpaSymbol("e\u0303"),
        ).toBe("\u1EBD");
    });

    it("returns an empty value for delimiters only", () => {
        expect(
            normaliseIpaTranscription("///"),
        ).toBe("");

        expect(
            normaliseIpaSymbol("///"),
        ).toBe("");
    });
});