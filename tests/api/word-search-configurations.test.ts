import { ActivityDifficulty } from "@/build/generated/prisma/client";
import { WORD_SEARCH_CONFIGURATION_SELECT, } from "@/lib/database/selections";
import { GET as getWordSearchConfigurations, POST as createWordSearchConfiguration, } from "@/app/api/word-search-configurations/route";
import {
    DELETE as deleteWordSearchConfiguration,
    GET as getWordSearchConfiguration,
    PATCH as updateWordSearchConfiguration,
} from "@/app/api/word-search-configurations/[configurationId]/route";
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
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

// Recreates the asynchronous context supplied by Next.js.
function configurationContext(
    configurationId = CONFIGURATION_ID,
) {
    return {
        params: Promise.resolve({
            configurationId,
        }),
    };
}

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

describe("Word Search configuration API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                wordSearchConfiguration: {
                    findMany:
                        databaseMocks.findMany,
                    create:
                        databaseMocks.create,
                    findUnique:
                        databaseMocks.findUnique,
                    update:
                        databaseMocks.update,
                    delete:
                        databaseMocks.delete,
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

    it("returns one mapped Word Search configuration", async () => {
        databaseMocks.findUnique
            .mockResolvedValue(
                WORD_SEARCH_CONFIGURATION_RECORD,
            );

        const response =
            await getWordSearchConfiguration(
                new Request(
                    `http://localhost/api/word-search-configurations/${CONFIGURATION_ID}`,
                ),
                configurationContext(),
            );

        expect(response.status).toBe(200);

        expect(
            databaseMocks.findUnique,
        ).toHaveBeenCalledWith({
            where: {
                id: CONFIGURATION_ID,
            },
            select:
                WORD_SEARCH_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toEqual({
            data: {
                id: CONFIGURATION_ID,
                name:
                    "Classroom Word Search",
                wordListId: LIST_ID,
                difficulty: "standard",
                seed: 260724,
                hintsEnabled: true,
                createdAt:
                    CREATED_AT.toISOString(),
                updatedAt:
                    UPDATED_AT.toISOString(),
                wordList: {
                    id: LIST_ID,
                    name: "Classroom words",
                    description:
                        "Term two content",
                    wordCount: 12,
                },
            },
        });
    });

    it("returns 404 for a missing configuration", async () => {
        databaseMocks.findUnique
            .mockResolvedValue(null);

        const response =
            await getWordSearchConfiguration(
                new Request(
                    `http://localhost/api/word-search-configurations/${CONFIGURATION_ID}`,
                ),
                configurationContext(),
            );

        await expectApiError(
            response,
            404,
            "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
        );
    });

    it("rejects an invalid configuration UUID", async () => {
        const response =
            await getWordSearchConfiguration(
                new Request(
                    "http://localhost/api/word-search-configurations/invalid",
                ),
                configurationContext(
                    "invalid",
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
            databaseMocks.findUnique,
        ).not.toHaveBeenCalled();
    });


    it("updates only supplied configuration fields", async () => {
        databaseMocks.update
            .mockResolvedValue({
                ...WORD_SEARCH_CONFIGURATION_RECORD,
                difficulty:
                    ActivityDifficulty.CHALLENGING,
                seed: 314159,
            });

        const response =
            await updateWordSearchConfiguration(
                jsonRequest(
                    `/api/word-search-configurations/${CONFIGURATION_ID}`,
                    "PATCH",
                    {
                        difficulty:
                            "challenging",
                        seed: 314159,
                    },
                ),
                configurationContext(),
            );

        expect(response.status).toBe(200);

        expect(
            databaseMocks.update,
        ).toHaveBeenCalledWith({
            where: {
                id: CONFIGURATION_ID,
            },
            data: {
                seed: 314159,
                difficulty:
                    ActivityDifficulty.CHALLENGING,
            },
            select:
                WORD_SEARCH_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: {
                id: CONFIGURATION_ID,
                difficulty: "challenging",
                seed: 314159,
            },
        });
    });

    it("rejects an empty configuration update", async () => {
        const response =
            await updateWordSearchConfiguration(
                jsonRequest(
                    `/api/word-search-configurations/${CONFIGURATION_ID}`,
                    "PATCH",
                    {},
                ),
                configurationContext(),
            );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(
            databaseMocks.update,
        ).not.toHaveBeenCalled();

        expect(
            databaseMocks.getDatabase,
        ).not.toHaveBeenCalled();
    });
        /** 
         * P2025: configuration does not exist.
         * P2002: requested name is already used.
         * P2003: requested word list does not exist. 
         * */
        it.each([
        [
            "P2025",
            404,
            "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
        ],
        [
            "P2002",
            409,
            "WORD_SEARCH_CONFIGURATION_NAME_CONFLICT",
        ],
        [
            "P2003",
            404,
            "WORD_LIST_NOT_FOUND",
        ],
    ] as const)(
        "maps Word Search update error %s",
        async (
            prismaCode,
            status,
            apiCode,
        ) => {
            databaseMocks.update
                .mockRejectedValue(
                    prismaError(prismaCode),
                );

            const response =
                await updateWordSearchConfiguration(
                    jsonRequest(
                        `/api/word-search-configurations/${CONFIGURATION_ID}`,
                        "PATCH",
                        {
                            name:
                                "Updated Word Search",
                            wordListId: LIST_ID,
                        },
                    ),
                    configurationContext(),
                );

            await expectApiError(
                response,
                status,
                apiCode,
            );
        },
    );

        it("deletes a Word Search configuration", async () => {
        databaseMocks.delete
            .mockResolvedValue(
                WORD_SEARCH_CONFIGURATION_RECORD,
            );

        const response =
            await deleteWordSearchConfiguration(
                new Request(
                    `http://localhost/api/word-search-configurations/${CONFIGURATION_ID}`,
                    {
                        method: "DELETE",
                    },
                ),
                configurationContext(),
            );

        expect(response.status).toBe(204);

        await expect(
            response.text(),
        ).resolves.toBe("");

        expect(
            databaseMocks.delete,
        ).toHaveBeenCalledWith({
            where: {
                id: CONFIGURATION_ID,
            },
        });
    });

    it("returns 404 when deleting a missing configuration", async () => {
        databaseMocks.delete
            .mockRejectedValue(
                prismaError("P2025"),
            );

        const response =
            await deleteWordSearchConfiguration(
                new Request(
                    `http://localhost/api/word-search-configurations/${CONFIGURATION_ID}`,
                    {
                        method: "DELETE",
                    },
                ),
                configurationContext(),
            );

        await expectApiError(
            response,
            404,
            "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
        );
    });

});