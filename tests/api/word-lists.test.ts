import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

import {
    GET as getWordLists,
    POST as createWordList,
} from "@/app/api/word-lists/route";
import {
    DELETE as deleteWordList,
    GET as getWordList,
    PATCH as updateWordList,
} from "@/app/api/word-lists/[listId]/route";
import {
    jsonRequest,
    listContext,
    prismaError,
    WORD_LIST_RECORD,
} from "@/tests/api/route-test-helpers";

async function expectApiError(
    response: Response,
    status: number,
    code: string,
) {
    expect(response.status).toBe(status);

    await expect(response.json()).resolves.toMatchObject({
        error: {
            code,
        },
    });
}

describe("word-list API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase.mockReturnValue({
            wordList: {
                findMany: databaseMocks.findMany,
                create: databaseMocks.create,
                findUnique: databaseMocks.findUnique,
                update: databaseMocks.update,
                delete: databaseMocks.delete,
            },
        });
    });

    it("returns word-list summaries", async () => {
        databaseMocks.findMany.mockResolvedValue([
            WORD_LIST_RECORD,
        ]);

        const response = await getWordLists();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({
            id: WORD_LIST_RECORD.id,
            name: "Classroom words",
            wordCount: 2,
        });
    });

    it("creates a validated word list", async () => {
        databaseMocks.create.mockResolvedValue({
            ...WORD_LIST_RECORD,
            name: "New classroom list",
            _count: {
                words: 0,
            },
        });

        const response = await createWordList(
            jsonRequest(
                "/api/word-lists",
                "POST",
                {
                    name: "  New classroom list  ",
                },
            ),
        );

        expect(response.status).toBe(201);

        expect(databaseMocks.create)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        name: "New classroom list",
                    },
                }),
            );

        await expect(response.json()).resolves.toMatchObject({
            data: {
                name: "New classroom list",
                wordCount: 0,
            },
        });
    });

    it("rejects invalid word-list input", async () => {
        const response = await createWordList(
            jsonRequest(
                "/api/word-lists",
                "POST",
                {
                    name: "   ",
                },
            ),
        );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(databaseMocks.getDatabase)
            .not.toHaveBeenCalled();
    });

    it("returns 409 for a duplicate list name", async () => {
        databaseMocks.create.mockRejectedValue(
            prismaError("P2002"),
        );

        const response = await createWordList(
            jsonRequest(
                "/api/word-lists",
                "POST",
                {
                    name: "Classroom words",
                },
            ),
        );

        await expectApiError(
            response,
            409,
            "WORD_LIST_NAME_CONFLICT",
        );
    });

    it("returns 404 for a missing word list", async () => {
        databaseMocks.findUnique.mockResolvedValue(null);

        const response = await getWordList(
            new Request(
                "http://localhost/api/word-lists/missing",
            ),
            listContext(),
        );

        await expectApiError(
            response,
            404,
            "WORD_LIST_NOT_FOUND",
        );
    });

    it("updates selected word-list fields", async () => {
        databaseMocks.update.mockResolvedValue({
            ...WORD_LIST_RECORD,
            description: "Updated description",
        });

        const response = await updateWordList(
            jsonRequest(
                `/api/word-lists/${WORD_LIST_RECORD.id}`,
                "PATCH",
                {
                    description:
                        "  Updated description  ",
                },
            ),
            listContext(),
        );

        expect(response.status).toBe(200);

        expect(databaseMocks.update)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        description:
                            "Updated description",
                    },
                }),
            );
    });

    it("deletes an unused word list", async () => {
        databaseMocks.delete.mockResolvedValue(
            WORD_LIST_RECORD,
        );

        const response = await deleteWordList(
            new Request(
                `http://localhost/api/word-lists/${WORD_LIST_RECORD.id}`,
                {
                    method: "DELETE",
                },
            ),
            listContext(),
        );

        expect(response.status).toBe(204);
        await expect(response.text()).resolves.toBe("");
    });

    it("returns 409 when an activity uses the list", async () => {
        databaseMocks.delete.mockRejectedValue(
            prismaError("P2003"),
        );

        const response = await deleteWordList(
            new Request(
                `http://localhost/api/word-lists/${WORD_LIST_RECORD.id}`,
                {
                    method: "DELETE",
                },
            ),
            listContext(),
        );

        await expectApiError(
            response,
            409,
            "WORD_LIST_IN_USE",
        );
    });

    it("returns 404 when deleting a missing word list", async () => {
        databaseMocks.delete.mockRejectedValue(
            prismaError("P2025"),
        );

        const response = await deleteWordList(
            new Request(
                `http://localhost/api/word-lists/${WORD_LIST_RECORD.id}`,
                {
                    method: "DELETE",
                },
            ),
            listContext(),
        );

        await expectApiError(
            response,
            404,
            "WORD_LIST_NOT_FOUND",
        );
    });

    it("rejects an invalid delete UUID before querying", async () => {
        const response = await deleteWordList(
            new Request(
                "http://localhost/api/word-lists/invalid",
                {
                    method: "DELETE",
                },
            ),
            listContext("invalid"),
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

    it("rejects an invalid list UUID", async () => {
        const response = await getWordList(
            new Request(
                "http://localhost/api/word-lists/invalid",
            ),
            listContext("invalid"),
        );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(databaseMocks.getDatabase)
            .not.toHaveBeenCalled();
    });
});