import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { ActivityDifficulty } from "@/build/generated/prisma/client";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({getDatabase: databaseMocks.getDatabase,}));

import {GET as getWordleConfigurations, POST as createWordleConfiguration, } from "@/app/api/wordle-configurations/route";
import { WORDLE_CONFIGURATION_SELECT } from "@/lib/database/selections";
import {
    CREATED_AT,
    jsonRequest,
    LIST_ID,
    prismaError,
    UPDATED_AT,
    WORD_ID,
} from "@/tests/api/route-test-helpers";

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

describe("Wordle configuration collection API", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase
            .mockReturnValue({
                wordleConfiguration: {
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
});