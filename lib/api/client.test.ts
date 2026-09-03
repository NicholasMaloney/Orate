import {
    describe,
    expect,
    it,
} from "vitest";

import {
    readApiData,
    requireNoContent,
} from "@/lib/api/client";

describe("client API helpers", () => {
    it("returns data from a successful response", async () => {
        const response = Response.json({
            data: {
                id: "word-one",
            },
        });

        await expect(
            readApiData<{ readonly id: string }>(
                response,
                "Fallback message.",
            ),
        ).resolves.toEqual({
            id: "word-one",
        });
    });

    it("uses the API error message", async () => {
        const response = Response.json(
            {
                error: {
                    code: "WORD_CONFLICT",
                    message:
                        "This word already exists in the word list.",
                },
            },
            {
                status: 409,
            },
        );

        await expect(
            readApiData(
                response,
                "Fallback message.",
            ),
        ).rejects.toThrow(
            "This word already exists in the word list.",
        );
    });

    it("uses the fallback for a non-JSON error", async () => {
        const response = new Response(
            "Service unavailable",
            {
                status: 503,
                headers: {
                    "Content-Type": "text/plain",
                },
            },
        );

        await expect(
            readApiData(
                response,
                "The request failed.",
            ),
        ).rejects.toThrow(
            "The request failed.",
        );
    });

    it("accepts a successful bodyless response", async () => {
        const response = new Response(null, {
            status: 204,
        });

        await expect(
            requireNoContent(
                response,
                "Deletion failed.",
            ),
        ).resolves.toBeUndefined();
    });

    it("reads deletion errors without parsing a 204", async () => {
        const response = Response.json(
            {
                error: {
                    code: "WORD_IN_USE",
                    message:
                        "The word is used by a saved activity.",
                },
            },
            {
                status: 409,
            },
        );

        await expect(
            requireNoContent(
                response,
                "Deletion failed.",
            ),
        ).rejects.toThrow(
            "The word is used by a saved activity.",
        );
    });
});