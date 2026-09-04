import {ActivityDifficulty} from "@/build/generated/prisma/client";
import {WORD_SEARCH_CONFIGURATION_SELECT,} from "@/lib/database/selections";
import {
    GET as getWordSearchConfigurations,
    POST as createWordSearchConfiguration,
} from "@/app/api/word-search-configurations/route";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    CREATED_AT,
    jsonRequest,
    LIST_ID,
    prismaError,
    UPDATED_AT,
} from "@/tests/api/route-test-helpers";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase:
        databaseMocks.getDatabase,
}));

const CONFIGURATION_ID =
    "77777777-7777-4777-8777-777777777777";

const WORD_SEARCH_CONFIGURATION_RECORD = {
    id: CONFIGURATION_ID,
    name: "Classroom Word Search",
    wordListId: LIST_ID,
    difficulty:
        ActivityDifficulty.STANDARD,
    seed: 260724,
    hintsEnabled: true,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    wordList: {
        id: LIST_ID,
        name: "Classroom words",
        description: "Term two content",
        _count: {
            words: 12,
        },
    },
};

async function expectApiError(
    response: Response,
    status: number,
    code: string,
): Promise<void> {
    expect(response.status).toBe(status);

    await expect(
        response.json(),
    ).resolves.toMatchObject({
        error: {
            code,
        },
    });
}

describe("Word Search configuration collection API", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                wordSearchConfiguration: {
                    findMany:
                        databaseMocks.findMany,
                    create:
                        databaseMocks.create,
                },
            });
    });

    it("returns mapped configurations in name order", async () => {
        databaseMocks.findMany
            .mockResolvedValue([
                WORD_SEARCH_CONFIGURATION_RECORD,
            ]);

        const response =
            await getWordSearchConfigurations();

        expect(response.status).toBe(200);

        expect(
            databaseMocks.findMany,
        ).toHaveBeenCalledWith({
            orderBy: {
                name: "asc",
            },
            select:
                WORD_SEARCH_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: [
                {
                    id: CONFIGURATION_ID,
                    difficulty: "standard",
                    seed: 260724,
                    wordList: {
                        id: LIST_ID,
                        description:
                            "Term two content",
                        wordCount: 12,
                    },
                },
            ],
        });
    });

    it("creates a validated configuration", async () => {
        databaseMocks.create
            .mockResolvedValue({
                ...WORD_SEARCH_CONFIGURATION_RECORD,
                name: "Easy revision",
                difficulty:
                    ActivityDifficulty.EASY,
                seed: 42,
                hintsEnabled: false,
            });

        const response =
            await createWordSearchConfiguration(
                jsonRequest(
                    "/api/word-search-configurations",
                    "POST",
                    {
                        name:
                            "  Easy revision  ",
                        wordListId: LIST_ID,
                        difficulty: "easy",
                        seed: 42,
                        hintsEnabled: false,
                    },
                ),
            );

        expect(response.status).toBe(201);

        expect(
            databaseMocks.create,
        ).toHaveBeenCalledWith({
            data: {
                name: "Easy revision",
                wordListId: LIST_ID,
                seed: 42,
                hintsEnabled: false,
                difficulty:
                    ActivityDifficulty.EASY,
            },
            select:
                WORD_SEARCH_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: {
                name: "Easy revision",
                wordListId: LIST_ID,
                difficulty: "easy",
                seed: 42,
                hintsEnabled: false,
                wordList: {
                    wordCount: 12,
                },
            },
        });
    });

    it.each([
        -2_147_483_649,
        2_147_483_648,
    ])(
        "rejects out-of-range seed %s before database access",
        async (seed) => {
            const response =
                await createWordSearchConfiguration(
                    jsonRequest(
                        "/api/word-search-configurations",
                        "POST",
                        {
                            name:
                                "Invalid seed",
                            wordListId:
                                LIST_ID,
                            difficulty:
                                "standard",
                            seed,
                            hintsEnabled: true,
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
        },
    );

    it("returns 409 for a duplicate name", async () => {
        databaseMocks.create
            .mockRejectedValue(
                prismaError("P2002"),
            );

        const response =
            await createWordSearchConfiguration(
                jsonRequest(
                    "/api/word-search-configurations",
                    "POST",
                    {
                        name:
                            "Classroom Word Search",
                        wordListId: LIST_ID,
                        difficulty: "standard",
                        seed: 260724,
                        hintsEnabled: true,
                    },
                ),
            );

        await expectApiError(
            response,
            409,
            "WORD_SEARCH_CONFIGURATION_NAME_CONFLICT",
        );
    });

    it("returns 404 for a missing word list", async () => {
        databaseMocks.create
            .mockRejectedValue(
                prismaError("P2003"),
            );

        const response =
            await createWordSearchConfiguration(
                jsonRequest(
                    "/api/word-search-configurations",
                    "POST",
                    {
                        name: "Missing list",
                        wordListId: LIST_ID,
                        difficulty: "standard",
                        seed: 260724,
                        hintsEnabled: true,
                    },
                ),
            );

        await expectApiError(
            response,
            404,
            "WORD_LIST_NOT_FOUND",
        );
    });
});