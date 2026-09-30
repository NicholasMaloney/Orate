import { GET } from "@/app/api/dashboard/route";
import { ActivityDifficulty, ActivityType, GenerationOutcome, MetricSource,} from "@/build/generated/prisma/client";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

// Creates fake database functions that can return controlled test data.
const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    wordListCount: vi.fn(),
    wordCount: vi.fn(),
    phonemeCount: vi.fn(),
    wordleConfigurationCount: vi.fn(),
    wordSearchConfigurationCount: vi.fn(),
    generationGroupBy: vi.fn(),
    pageAggregate: vi.fn(),
    pageGroupBy: vi.fn(),
    wordleFindMany: vi.fn(),
    wordSearchFindMany: vi.fn(),
}));

// Replaces the real database connection with the fake database.
vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

// Provides a fixed date so the generatedAt value is predictable.
const GENERATED_AT =
    new Date("2026-09-30T10:00:00.000Z");

// Provides Wordle configurations for testing recent activity ordering.
const WORDLE_CONFIGURATIONS = [
    {
        id: "wordle-newest",
        name: "Newest Wordle",
        difficulty:
            ActivityDifficulty.STANDARD,
        updatedAt:
            new Date(
                "2026-09-30T08:00:00.000Z",
            ),
    },
    {
        id: "wordle-third",
        name: "Third Wordle",
        difficulty:
            ActivityDifficulty.EASY,
        updatedAt:
            new Date(
                "2026-09-28T08:00:00.000Z",
            ),
    },
    {
        id: "wordle-fifth",
        name: "Fifth Wordle",
        difficulty:
            ActivityDifficulty.CHALLENGING,
        updatedAt:
            new Date(
                "2026-09-26T08:00:00.000Z",
            ),
    },
    {
        id: "wordle-seventh",
        name: "Seventh Wordle",
        difficulty:
            ActivityDifficulty.STANDARD,
        updatedAt:
            new Date(
                "2026-09-24T08:00:00.000Z",
            ),
    },
];

// Provides Word Search configurations for testing recent activity ordering.
const WORD_SEARCH_CONFIGURATIONS = [
    {
        id: "word-search-second",
        name: "Second Word Search",
        difficulty:
            ActivityDifficulty.CHALLENGING,
        updatedAt:
            new Date(
                "2026-09-29T08:00:00.000Z",
            ),
    },
    {
        id: "word-search-fourth",
        name: "Fourth Word Search",
        difficulty:
            ActivityDifficulty.STANDARD,
        updatedAt:
            new Date(
                "2026-09-27T08:00:00.000Z",
            ),
    },
    {
        id: "word-search-sixth",
        name: "Sixth Word Search",
        difficulty:
            ActivityDifficulty.EASY,
        updatedAt:
            new Date(
                "2026-09-25T08:00:00.000Z",
            ),
    },
    {
        id: "word-search-eighth",
        name: "Eighth Word Search",
        difficulty:
            ActivityDifficulty.STANDARD,
        updatedAt:
            new Date(
                "2026-09-23T08:00:00.000Z",
            ),
    },
];

// Makes every database query return an empty result.
function mockEmptyDashboardData(): void {
    databaseMocks.wordListCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
    databaseMocks.wordCount
        .mockResolvedValue(0);
    databaseMocks.phonemeCount
        .mockResolvedValue(0);
    databaseMocks.wordleConfigurationCount
        .mockResolvedValue(0);
    databaseMocks.wordSearchConfigurationCount
        .mockResolvedValue(0);
    databaseMocks.generationGroupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
    databaseMocks.pageAggregate
        .mockResolvedValue({
            _avg: {
                durationMs: null,
            },
            _count: {
                _all: 0,
            },
        });
    databaseMocks.pageGroupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
    databaseMocks.wordleFindMany
        .mockResolvedValue([]);
    databaseMocks.wordSearchFindMany
        .mockResolvedValue([]);
}

// Groups all tests for the dashboard API route.
describe("GET /api/dashboard", () => {
    // Resets the fake functions and rebuilds the fake database before each test.
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                wordList: {
                    count:
                        databaseMocks.wordListCount,
                },
                word: {
                    count:
                        databaseMocks.wordCount,
                },
                wordPhoneme: {
                    count:
                        databaseMocks.phonemeCount,
                },
                wordleConfiguration: {
                    count:
                        databaseMocks
                            .wordleConfigurationCount,
                    findMany:
                        databaseMocks.wordleFindMany,
                },
                wordSearchConfiguration: {
                    count:
                        databaseMocks
                            .wordSearchConfigurationCount,
                    findMany:
                        databaseMocks
                            .wordSearchFindMany,
                },
                activityGeneration: {
                    groupBy:
                        databaseMocks
                            .generationGroupBy,
                },
                pageView: {
                    aggregate:
                        databaseMocks.pageAggregate,
                    groupBy:
                        databaseMocks.pageGroupBy,
                },
            });
    });

    // Restores timers and other replaced functions after each test.
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // Checks that the route correctly combines all dashboard statistics.
    it("returns aggregated dashboard statistics", async () => {
        // Fixes the current time so the response date can be checked.
        vi.useFakeTimers();
        vi.setSystemTime(GENERATED_AT);

        // Provides the content and configuration totals.
        databaseMocks.wordListCount
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(1);
        databaseMocks.wordCount
            .mockResolvedValue(18);
        databaseMocks.phonemeCount
            .mockResolvedValue(52);
        databaseMocks.wordleConfigurationCount
            .mockResolvedValue(3);
        databaseMocks.wordSearchConfigurationCount
            .mockResolvedValue(2);

        // Provides generation results, followed by their record sources.
        databaseMocks.generationGroupBy
            .mockResolvedValueOnce([
                {
                    activityType:
                        ActivityType.WORD_SEARCH,
                    outcome:
                        GenerationOutcome.FAILURE,
                    _count: {
                        _all: 3,
                    },
                },
                {
                    activityType:
                        ActivityType.WORDLE,
                    outcome:
                        GenerationOutcome.SUCCESS,
                    _count: {
                        _all: 8,
                    },
                },
                {
                    activityType:
                        ActivityType.WORD_SEARCH,
                    outcome:
                        GenerationOutcome.SUCCESS,
                    _count: {
                        _all: 3,
                    },
                },
                {
                    activityType:
                        ActivityType.WORDLE,
                    outcome:
                        GenerationOutcome.FAILURE,
                    _count: {
                        _all: 2,
                    },
                },
            ])
            .mockResolvedValueOnce([
                {
                    source:
                        MetricSource.LIVE,
                    _count: {
                        _all: 7,
                    },
                },
                {
                    source:
                        MetricSource.SIMULATED,
                    _count: {
                        _all: 9,
                    },
                },
            ]);

        // Provides the overall average time spent on activity pages.
        databaseMocks.pageAggregate
            .mockResolvedValue({
                _avg: {
                    durationMs: 69_876,
                },
                _count: {
                    _all: 5,
                },
            });

        // Provides page statistics, followed by their record sources.
        databaseMocks.pageGroupBy
            .mockResolvedValueOnce([
                {
                    path: "/word-search",
                    _avg: {
                        durationMs: 84_321,
                    },
                    _count: {
                        _all: 3,
                    },
                },
                {
                    path: "/wordle",
                    _avg: {
                        durationMs: 55_555,
                    },
                    _count: {
                        _all: 2,
                    },
                },
                {
                    path: "/settings",
                    _avg: {
                        durationMs: 20_000,
                    },
                    _count: {
                        _all: 1,
                    },
                },
            ])
            .mockResolvedValueOnce([
                {
                    source:
                        MetricSource.LIVE,
                    _count: {
                        _all: 4,
                    },
                },
                {
                    source:
                        MetricSource.SIMULATED,
                    _count: {
                        _all: 6,
                    },
                },
            ]);

        // Provides the recent configurations for both activity types.
        databaseMocks.wordleFindMany
            .mockResolvedValue(
                WORDLE_CONFIGURATIONS,
            );
        databaseMocks.wordSearchFindMany
            .mockResolvedValue(
                WORD_SEARCH_CONFIGURATIONS,
            );

        // Runs the dashboard route.
        const response = await GET();

        // Confirms that the request was successful.
        expect(response.status).toBe(200);

        // Confirms that both total and empty word lists were counted.
        expect(
            databaseMocks.wordListCount.mock.calls,
        ).toEqual([
            [],
            [
                {
                    where: {
                        words: {
                            none: {},
                        },
                    },
                },
            ],
        ]);

        // Confirms that generation results were grouped correctly.
        expect(
            databaseMocks.generationGroupBy,
        ).toHaveBeenNthCalledWith(
            1,
            {
                by: [
                    "activityType",
                    "outcome",
                ],
                _count: {
                    _all: true,
                },
            },
        );

        // Confirms that generation records were grouped by source.
        expect(
            databaseMocks.generationGroupBy,
        ).toHaveBeenNthCalledWith(
            2,
            {
                by: ["source"],
                _count: {
                    _all: true,
                },
            },
        );

        // Confirms that the average page duration was requested.
        expect(
            databaseMocks.pageAggregate,
        ).toHaveBeenCalledWith({
            _avg: {
                durationMs: true,
            },
            _count: {
                _all: true,
            },
        });

        // Confirms that the six most recent Wordle configurations were requested.
        expect(
            databaseMocks.wordleFindMany,
        ).toHaveBeenCalledWith({
            take: 6,
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                name: true,
                difficulty: true,
                updatedAt: true,
            },
        });

        // Confirms that the six most recent Word Search configurations were requested.
        expect(
            databaseMocks.wordSearchFindMany,
        ).toHaveBeenCalledWith({
            take: 6,
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                name: true,
                difficulty: true,
                updatedAt: true,
            },
        });

        // Confirms that the route returns the correctly calculated dashboard data.
        await expect(
            response.json(),
        ).resolves.toEqual({
            data: {
                wordListCount: 4,
                wordCount: 18,
                phonemeCount: 52,
                emptyWordListCount: 1,
                generatedOutputCount: 11,
                failedGenerationCount: 5,
                averageTimeOnPageSeconds:
                    69.9,
                mostUsedActivityType:
                    "wordle",
                activities: [
                    {
                        activityType: "wordle",
                        createdCount: 3,
                        successfulGenerationCount:
                            8,
                        failedGenerationCount: 2,
                        successRate: 80,
                    },
                    {
                        activityType:
                            "word-search",
                        createdCount: 2,
                        successfulGenerationCount:
                            3,
                        failedGenerationCount: 3,
                        successRate: 50,
                    },
                ],
                pageAverages: [
                    {
                        path: "/wordle",
                        viewCount: 2,
                        averageSeconds: 55.6,
                    },
                    {
                        path: "/word-search",
                        viewCount: 3,
                        averageSeconds: 84.3,
                    },
                ],
                recentConfigurations: [
                    {
                        id: "wordle-newest",
                        name: "Newest Wordle",
                        activityType: "wordle",
                        difficulty: "standard",
                        updatedAt:
                            "2026-09-30T08:00:00.000Z",
                    },
                    {
                        id:
                            "word-search-second",
                        name:
                            "Second Word Search",
                        activityType:
                            "word-search",
                        difficulty:
                            "challenging",
                        updatedAt:
                            "2026-09-29T08:00:00.000Z",
                    },
                    {
                        id: "wordle-third",
                        name: "Third Wordle",
                        activityType: "wordle",
                        difficulty: "easy",
                        updatedAt:
                            "2026-09-28T08:00:00.000Z",
                    },
                    {
                        id:
                            "word-search-fourth",
                        name:
                            "Fourth Word Search",
                        activityType:
                            "word-search",
                        difficulty: "standard",
                        updatedAt:
                            "2026-09-27T08:00:00.000Z",
                    },
                    {
                        id: "wordle-fifth",
                        name: "Fifth Wordle",
                        activityType: "wordle",
                        difficulty:
                            "challenging",
                        updatedAt:
                            "2026-09-26T08:00:00.000Z",
                    },
                    {
                        id:
                            "word-search-sixth",
                        name:
                            "Sixth Word Search",
                        activityType:
                            "word-search",
                        difficulty: "easy",
                        updatedAt:
                            "2026-09-25T08:00:00.000Z",
                    },
                ],
                recordSources: {
                    live: 11,
                    simulated: 15,
                },
                generatedAt:
                    GENERATED_AT.toISOString(),
            },
        });
    });

    // Checks that empty database tables produce safe default values.
    it("returns zeros and nulls when the tables are empty", async () => {
        // Uses a fixed time and empty database results.
        vi.useFakeTimers();
        vi.setSystemTime(GENERATED_AT);
        mockEmptyDashboardData();

        // Runs the dashboard route.
        const response = await GET();

        // Confirms that an empty database is still a successful request.
        expect(response.status).toBe(200);

        // Confirms that missing statistics become zeros, nulls, or empty lists.
        await expect(
            response.json(),
        ).resolves.toEqual({
            data: {
                wordListCount: 0,
                wordCount: 0,
                phonemeCount: 0,
                emptyWordListCount: 0,
                generatedOutputCount: 0,
                failedGenerationCount: 0,
                averageTimeOnPageSeconds:
                    null,
                mostUsedActivityType: null,
                activities: [
                    {
                        activityType: "wordle",
                        createdCount: 0,
                        successfulGenerationCount:
                            0,
                        failedGenerationCount: 0,
                        successRate: null,
                    },
                    {
                        activityType:
                            "word-search",
                        createdCount: 0,
                        successfulGenerationCount:
                            0,
                        failedGenerationCount: 0,
                        successRate: null,
                    },
                ],
                pageAverages: [
                    {
                        path: "/wordle",
                        viewCount: 0,
                        averageSeconds: null,
                    },
                    {
                        path: "/word-search",
                        viewCount: 0,
                        averageSeconds: null,
                    },
                ],
                recentConfigurations: [],
                recordSources: {
                    live: 0,
                    simulated: 0,
                },
                generatedAt:
                    GENERATED_AT.toISOString(),
            },
        });
    });

    // Checks that database failures return a safe error response.
    it("returns a generic error when aggregation fails", async () => {
        // Creates a private database error that must not be returned to the user.
        const databaseError =
            new Error(
                "Connection details must remain private.",
            );

        // Prevents the expected error message from appearing in the test output.
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(
                () => undefined,
            );

        // Makes the first database query fail.
        databaseMocks.wordListCount
            .mockRejectedValueOnce(
                databaseError,
            );

        // Runs the dashboard route.
        const response = await GET();

        // Confirms that the route reports a server error.
        expect(response.status).toBe(500);

        // Confirms that the response contains a safe public message.
        await expect(
            response.json(),
        ).resolves.toEqual({
            error: {
                code:
                    "DASHBOARD_UNAVAILABLE",
                message:
                    "Dashboard statistics could not be loaded.",
            },
        });

        // Confirms that the original error is recorded for debugging.
        expect(consoleError).toHaveBeenCalledWith(
            "Unable to load dashboard statistics.",
            databaseError,
        );
    });
});