// These route tests use the real route and validation schema while mocking only database access.

import {
    ActivityType,
    GenerationOutcome,
    MetricSource,
} from "@/build/generated/prisma/client";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { POST, } from "@/app/api/metrics/route";
import { jsonRequest } from "@/tests/api/route-test-helpers";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    createGeneration: vi.fn(),
    createPageView: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

async function expectApiError(
    response: Response,
    status: number,
    code: string,
    message?: string,
) {
    expect(response.status).toBe(status);

    await expect(response.json(),).resolves.toMatchObject({
        error: {
            code,
            ...(message ? { message } : {}),
        },
    });
}

describe("POST /api/metrics", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                activityGeneration: {
                    create: databaseMocks.createGeneration,
                },
                pageView: {
                    create: databaseMocks.createPageView,
                },
            });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("records a live generation metric", async () => {
        databaseMocks.createGeneration.mockResolvedValue({});

        const response = await POST(
            jsonRequest(
                "/api/metrics",
                "POST",
                {
                    kind: "generation",
                    activityType: "wordle",
                    outcome: "success",
                },
            ),
        );

        expect(response.status).toBe(201);

        await expect(
            response.json(),
        ).resolves.toEqual({
            data: {
                recorded: true,
            },
        });

        expect(
            databaseMocks.createGeneration,
        ).toHaveBeenCalledWith({
            data: {
                activityType: ActivityType.WORDLE,
                outcome: GenerationOutcome.SUCCESS,
                source: MetricSource.LIVE,
                message: null,
            },
        });

        expect(databaseMocks.createPageView,
        ).not.toHaveBeenCalled();
    });


    it("records a live builder page view", async () => {
        databaseMocks.createPageView.mockResolvedValue({});

        const response = await POST(
            jsonRequest(
                "/api/metrics",
                "POST",
                {
                    kind: "page-view",
                    path: "/word-search",
                    durationMs: 45_000,
                },
            ),
        );

        expect(response.status).toBe(201);

        expect(
            databaseMocks.createPageView,
        ).toHaveBeenCalledWith({
            data: {
                path: "/word-search",
                durationMs: 45_000,
                source: MetricSource.LIVE,
            },
        });

        expect(
            databaseMocks.createGeneration,
        ).not.toHaveBeenCalled();
    });

    it("rejects invalid metrics before database access", async () => {
        const response = await POST(
            jsonRequest(
                "/api/metrics",
                "POST",
                {
                    kind: "page-view",
                    path: "/settings",
                    durationMs: -1,
                },
            ),
        );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(
            databaseMocks.getDatabase,
        ).not.toHaveBeenCalled();

        expect(
            databaseMocks.createGeneration,
        ).not.toHaveBeenCalled();

        expect(
            databaseMocks.createPageView,
        ).not.toHaveBeenCalled();
    });

    it("rejects a client-supplied metric source", async () => {
        const response = await POST(
            jsonRequest(
                "/api/metrics",
                "POST",
                {
                    kind: "generation",
                    activityType: "wordle",
                    outcome: "success",
                    source: "SIMULATED",
                },
            ),
        );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(
            databaseMocks.getDatabase,
        ).not.toHaveBeenCalled();
    });

    it("returns a generic error when metric recording fails", async () => {
        const databaseError =
            new Error("Database unavailable.");

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(
                () => undefined,
            );

        databaseMocks.createGeneration
            .mockRejectedValue(
                databaseError,
            );

        const response = await POST(
            jsonRequest(
                "/api/metrics",
                "POST",
                {
                    kind: "generation",
                    activityType: "word-search",
                    outcome: "failure",
                    message:
                        "Unable to build the activity.",
                },
            ),
        );

        await expectApiError(
            response,
            500,
            "METRIC_RECORDING_FAILED",
            "The metric could not be recorded.",
        );

        expect(consoleError).toHaveBeenCalledWith(
            "Unable to record an observability metric.",
            databaseError,
        );
    });
});