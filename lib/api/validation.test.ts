import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createMetricSchema,
    createWordListSchema,
    createWordSchema,
    createWordSearchConfigurationSchema,
    parseJsonRequest,
    updateWordListSchema,
} from "@/lib/api/validation";

describe("API validation", () => {
    it("trims valid word-list input", () => {
        const result = createWordListSchema.parse({
            name: "  Classroom words  ",
            description: "  Term two content  ",
        });

        expect(result).toEqual({
            name: "Classroom words",
            description: "Term two content",
        });
    });

    it("preserves ordered multi-character phonemes", () => {
        const result = createWordSchema.parse({
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
            ],
        });

        expect(
            result.phonemes.map(
                ({ ipaSymbol }) => ipaSymbol,
            ),
        ).toEqual([
            "tʃ",
            "ɪ",
        ]);
    });

    it("normalizes word and phoneme IPA conventions", () => {
        const result = createWordSchema.parse({
            english: "chin",
            ipa: " //tʃɪn// ",
            phonemes: [
                {
                    ipaSymbol: "/tʃ/",
                    grapheme: "CH",
                    exampleWord: "chin",
                    spokenName: "ch",
                },
            ],
        });

        expect(result.ipa).toBe("/tʃɪn/");
        expect(result.phonemes[0].ipaSymbol).toBe("tʃ");
    });

    it("rejects IPA values containing only delimiters", () => {
        const result = createWordSchema.safeParse({
            english: "invalid",
            ipa: "///",
            phonemes: [
                {
                    ipaSymbol: "/",
                    grapheme: "X",
                    exampleWord: "example",
                    spokenName: "invalid",
                },
            ],
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error(
                "Delimiter-only IPA should not pass validation.",
            );
        }

        expect(
            result.error.issues.map(
                (issue) => issue.path.join("."),
            ),
        ).toEqual(
            expect.arrayContaining([
                "ipa",
                "phonemes.0.ipaSymbol",
            ]),
        );
    });

    it("rejects empty update requests", () => {
        const result =
            updateWordListSchema.safeParse({});

        expect(result.success).toBe(false);
    });

    it("rejects invalid IDs and unsupported seeds", () => {
        const result =
            createWordSearchConfigurationSchema.safeParse({
                name: "Invalid configuration",
                wordListId: "not-a-uuid",
                difficulty: "standard",
                seed: 2_147_483_648,
                hintsEnabled: true,
            });

        expect(result.success).toBe(false);
    });

    it("accepts a successful Wordle feneration metric", () => {
        const result = createMetricSchema.parse({
            kind: "generation",
            activityType: "wordle",
            outcome: "success",
        });

        expect(result).toEqual({
            kind: "generation",
            activityType: "wordle",
            outcome: "success", 
        });
    });

    it("accepts and trims a Word Search failure message", () => {
        const result = createMetricSchema.parse({
            kind: "generation",
            activityType: "word-search",
            outcome: "failure",
            message: "A word exceeded the grid size.",
        });

        expect(result).toEqual({
            kind: "generation",
            activityType: "word-search",
            outcome: "failure", 
            message: "A word exceeded the grid size.",
        });
    });

    it("accepts a tracked builder page view", () => {
        const result = createMetricSchema.parse({
            kind: "page-view",
            path: "/wordle",
            durationMs: 45_000,
        });

        expect(result).toEqual({
            kind: "page-view",
            path: "/wordle",
            durationMs: 45_000,
        });
    });

    it("rejects an untracked page path", () => {
        const result = createMetricSchema.safeParse({
            kind: "page-view",
            path: "/settings",
            durationMs: 45_000,
        });

        expect(result.success).toBe(false);
    });

    it.each([
        -1,
        999,
        14_400_001,
    ])(
        "rejects unsupported page-view duration",
        (durationMs) => {
            const result =
                createMetricSchema.safeParse({
                    kind: "page-view",
                    path: "/wordle",
                    durationMs,
                });

            expect(result.success).toBe(false);
        },
    );

    it("rejects a client supplied metric source", () => {
        const result = createMetricSchema.safeParse({
            kind: "generation",
            activityType: "wordle",
            outcome: "success",
            source: "SIMULATED",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a generation message over 200 characters", () => {
        const result = createMetricSchema.safeParse({
            kind: "generation",
            activityType: "wordle",
            outcome: "failure",
            message: "x".repeat(201),
        });

        expect(result.success).toBe(false);
    });


    it("parses and validates a JSON request", async () => {
        const request = new Request(
            "http://localhost/api/word-lists",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "  Starter list  ",
                }),
            },
        );

        const result = await parseJsonRequest(
            request,
            createWordListSchema,
        );

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.name).toBe("Starter list");
        }
    });

    it("returns a consistent malformed-JSON error", async () => {
        const request = new Request(
            "http://localhost/api/word-lists",
            {
                method: "POST",
                body: '{"name":',
            },
        );

        const result = await parseJsonRequest(
            request,
            createWordListSchema,
        );

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error(
                "Malformed JSON should not pass validation.",
            );
        }

        expect(result.response.status).toBe(400);
        await expect(
            result.response.json(),
        ).resolves.toEqual({
            error: {
                code: "INVALID_JSON",
                message:
                    "Request body must contain valid JSON.",
            },
        });
    });
});