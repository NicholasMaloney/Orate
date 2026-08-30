import {
    describe,
    expect,
    it,
} from "vitest";

import {
    errorResponse,
    noContentResponse,
    successResponse,
} from "@/lib/api/responses";

describe("API response helpers", () => {
    it("creates a successful JSON response", async () => {
        const response = successResponse(
            { id: "word-list-1" },
            201,
        );

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({
            data: {
                id: "word-list-1",
            },
        });
    });

    it("creates a structured error response", async () => {
        const response = errorResponse(
            "VALIDATION_ERROR",
            "Request validation failed.",
            400,
            [
                {
                    path: "name",
                    message: "Name is required.",
                },
            ],
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Request validation failed.",
                details: [
                    {
                        path: "name",
                        message: "Name is required.",
                    },
                ],
            },
        });
    });

    it("creates an empty no-content response", async () => {
        const response = noContentResponse();

        expect(response.status).toBe(204);
        await expect(response.text()).resolves.toBe("");
    });
});