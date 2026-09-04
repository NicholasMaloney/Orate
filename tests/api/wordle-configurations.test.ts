import { ActivityDifficulty } from "@/build/generated/prisma/client";
import { GET as getWordleConfigurations, POST as createWordleConfiguration, } from "@/app/api/wordle-configurations/route";
import { WORDLE_CONFIGURATION_SELECT } from "@/lib/database/selections";
import {
    CREATED_AT,
    jsonRequest,
    LIST_ID,
    prismaError,
    UPDATED_AT,
    WORD_ID,
} from "@/tests/api/route-test-helpers";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    DELETE as deleteWordleConfiguration,
    GET as getWordleConfiguration,
    PATCH as updateWordleConfiguration,
} from "@/app/api/wordle-configurations/[configurationId]/route";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({ getDatabase: databaseMocks.getDatabase, }));

const CONFIGURATION_ID =
    "66666666-6666-4666-8666-666666666666";

const WORDLE_CONFIGURATION_RECORD = {
    id: CONFIGURATION_ID,
    name: "Classroom Wordle",
    wordId: WORD_ID,
    difficulty:
        ActivityDifficulty.STANDARD,
    hintsEnabled: true,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    word: {
        id: WORD_ID,
        wordListId: LIST_ID,
        english: "chin",
        ipa: "/tʃɪn/",
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

describe("Wordle configuration API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                wordleConfiguration: {
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
                WORDLE_CONFIGURATION_RECORD,
            ]);

        const response =
            await getWordleConfigurations();

        expect(response.status).toBe(200);

        expect(
            databaseMocks.findMany,
        ).toHaveBeenCalledWith({
            orderBy: {
                name: "asc",
            },
            select:
                WORDLE_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: [
                {
                    id: CONFIGURATION_ID,
                    name: "Classroom Wordle",
                    difficulty: "standard",
                    createdAt:
                        CREATED_AT.toISOString(),
                    updatedAt:
                        UPDATED_AT.toISOString(),
                    word: {
                        id: WORD_ID,
                        wordListId: LIST_ID,
                    },
                },
            ],
        });
    });

    it("creates a validated configuration", async () => {
        databaseMocks.create
            .mockResolvedValue({
                ...WORDLE_CONFIGURATION_RECORD,
                name: "Challenging Wordle",
                difficulty:
                    ActivityDifficulty.CHALLENGING,
                hintsEnabled: false,
            });

        const response =
            await createWordleConfiguration(
                jsonRequest(
                    "/api/wordle-configurations",
                    "POST",
                    {
                        name:
                            "  Challenging Wordle  ",
                        wordId: WORD_ID,
                        difficulty:
                            "challenging",
                        hintsEnabled: false,
                    },
                ),
            );

        expect(response.status).toBe(201);

        expect(
            databaseMocks.create,
        ).toHaveBeenCalledWith({
            data: {
                name: "Challenging Wordle",
                wordId: WORD_ID,
                difficulty:
                    ActivityDifficulty.CHALLENGING,
                hintsEnabled: false,
            },
            select:
                WORDLE_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: {
                name: "Challenging Wordle",
                wordId: WORD_ID,
                difficulty: "challenging",
                hintsEnabled: false,
            },
        });
    });

    it("rejects invalid input before database access", async () => {
        const response =
            await createWordleConfiguration(
                jsonRequest(
                    "/api/wordle-configurations",
                    "POST",
                    {
                        name: "   ",
                        wordId: "invalid",
                        difficulty: "unknown",
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
    });

    it("returns 409 for a duplicate name", async () => {
        databaseMocks.create
            .mockRejectedValue(
                prismaError("P2002"),
            );

        const response =
            await createWordleConfiguration(
                jsonRequest(
                    "/api/wordle-configurations",
                    "POST",
                    {
                        name: "Classroom Wordle",
                        wordId: WORD_ID,
                        difficulty: "standard",
                        hintsEnabled: true,
                    },
                ),
            );

        await expectApiError(
            response,
            409,
            "WORDLE_CONFIGURATION_NAME_CONFLICT",
        );
    });

    it("returns 404 for a missing target word", async () => {
        databaseMocks.create
            .mockRejectedValue(
                prismaError("P2003"),
            );

        const response =
            await createWordleConfiguration(
                jsonRequest(
                    "/api/wordle-configurations",
                    "POST",
                    {
                        name: "Missing target",
                        wordId: WORD_ID,
                        difficulty: "easy",
                        hintsEnabled: true,
                    },
                ),
            );

        await expectApiError(
            response,
            404,
            "WORD_NOT_FOUND",
        );
    });

    it("returns one mapped Wordle configuration", async () => {
        databaseMocks.findUnique
            .mockResolvedValue(
                WORDLE_CONFIGURATION_RECORD,
            );

        const response =
            await getWordleConfiguration(
                new Request(
                    `http://localhost/api/wordle-configurations/${CONFIGURATION_ID}`,
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
                WORDLE_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toEqual({
            data: {
                id: CONFIGURATION_ID,
                name: "Classroom Wordle",
                wordId: WORD_ID,
                difficulty: "standard",
                hintsEnabled: true,
                createdAt:
                    CREATED_AT.toISOString(),
                updatedAt:
                    UPDATED_AT.toISOString(),
                word: {
                    id: WORD_ID,
                    wordListId: LIST_ID,
                    english: "chin",
                    ipa: "/tʃɪn/",
                },
            },
        });
    });

    it("returns 404 for a missing configuration", async () => {
        databaseMocks.findUnique
            .mockResolvedValue(null);

        const response =
            await getWordleConfiguration(
                new Request(
                    `http://localhost/api/wordle-configurations/${CONFIGURATION_ID}`,
                ),
                configurationContext(),
            );

        await expectApiError(
            response,
            404,
            "WORDLE_CONFIGURATION_NOT_FOUND",
        );
    });

    it("rejects an invalid configuration UUID", async () => {
        const response =
            await getWordleConfiguration(
                new Request(
                    "http://localhost/api/wordle-configurations/invalid",
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
                ...WORDLE_CONFIGURATION_RECORD,
                difficulty:
                    ActivityDifficulty.EASY,
                hintsEnabled: false,
            });

        const response =
            await updateWordleConfiguration(
                jsonRequest(
                    `/api/wordle-configurations/${CONFIGURATION_ID}`,
                    "PATCH",
                    {
                        difficulty: "easy",
                        hintsEnabled: false,
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
                hintsEnabled: false,
                difficulty:
                    ActivityDifficulty.EASY,
            },
            select:
                WORDLE_CONFIGURATION_SELECT,
        });

        await expect(
            response.json(),
        ).resolves.toMatchObject({
            data: {
                id: CONFIGURATION_ID,
                difficulty: "easy",
                hintsEnabled: false,
            },
        });
    });

    it("rejects an empty configuration update", async () => {
        const response =
            await updateWordleConfiguration(
                jsonRequest(
                    `/api/wordle-configurations/${CONFIGURATION_ID}`,
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

    it.each([
        [
            "P2025",
            404,
            "WORDLE_CONFIGURATION_NOT_FOUND",
        ],
        [
            "P2002",
            409,
            "WORDLE_CONFIGURATION_NAME_CONFLICT",
        ],
        [
            "P2003",
            404,
            "WORD_NOT_FOUND",
        ],
    ] as const)(
        "maps Wordle update error %s",
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
                await updateWordleConfiguration(
                    jsonRequest(
                        `/api/wordle-configurations/${CONFIGURATION_ID}`,
                        "PATCH",
                        {
                            name:
                                "Updated Wordle",
                            wordId: WORD_ID,
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

        it("deletes a Wordle configuration", async () => {
        databaseMocks.delete
            .mockResolvedValue(
                WORDLE_CONFIGURATION_RECORD,
            );

        const response =
            await deleteWordleConfiguration(
                new Request(
                    `http://localhost/api/wordle-configurations/${CONFIGURATION_ID}`,
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
            await deleteWordleConfiguration(
                new Request(
                    `http://localhost/api/wordle-configurations/${CONFIGURATION_ID}`,
                    {
                        method: "DELETE",
                    },
                ),
                configurationContext(),
            );

        await expectApiError(
            response,
            404,
            "WORDLE_CONFIGURATION_NOT_FOUND",
        );
    });

});