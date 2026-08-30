import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    wordListFindUnique: vi.fn(),
    wordCreate: vi.fn(),
    wordFindUnique: vi.fn(),
    wordUpdate: vi.fn(),
    wordDelete: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

import {
    GET as getWords,
    POST as createWord,
} from "@/app/api/word-lists/[listId]/words/route";
import {
    DELETE as deleteWord,
    GET as getWord,
    PATCH as updateWord,
} from "@/app/api/words/[wordId]/route";
import {
    jsonRequest,
    listContext,
    prismaError,
    WORD_ID,
    WORD_INPUT,
    WORD_RECORD,
    wordContext,
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

describe("word API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase.mockReturnValue({
            wordList: {
                findUnique:
                    databaseMocks.wordListFindUnique,
            },
            word: {
                create: databaseMocks.wordCreate,
                findUnique:
                    databaseMocks.wordFindUnique,
                update: databaseMocks.wordUpdate,
                delete: databaseMocks.wordDelete,
            },
        });
    });

    it("returns words from an existing list", async () => {
        databaseMocks.wordListFindUnique
            .mockResolvedValue({
                words: [WORD_RECORD],
            });

        const response = await getWords(
            new Request(
                "http://localhost/api/word-lists/list/words",
            ),
            listContext(),
        );

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({
            id: WORD_ID,
            english: "chin",
        });
    });

    it("returns 404 when the parent list is missing", async () => {
        databaseMocks.wordListFindUnique
            .mockResolvedValue(null);

        const response = await getWords(
            new Request(
                "http://localhost/api/word-lists/list/words",
            ),
            listContext(),
        );

        await expectApiError(
            response,
            404,
            "WORD_LIST_NOT_FOUND",
        );
    });

    it("creates ordered phoneme records", async () => {
        databaseMocks.wordCreate.mockResolvedValue(
            WORD_RECORD,
        );

        const response = await createWord(
            jsonRequest(
                "/api/word-lists/list/words",
                "POST",
                WORD_INPUT,
            ),
            listContext(),
        );

        expect(response.status).toBe(201);

        const createArguments =
            databaseMocks.wordCreate.mock.calls[0][0];

        expect(
            createArguments.data.phonemes.create.map(
                ({
                    ipaSymbol,
                    position,
                }: {
                    ipaSymbol: string;
                    position: number;
                }) => ({
                    ipaSymbol,
                    position,
                }),
            ),
        ).toEqual([
            {
                ipaSymbol: "tʃ",
                position: 0,
            },
            {
                ipaSymbol: "ɪ",
                position: 1,
            },
            {
                ipaSymbol: "n",
                position: 2,
            },
        ]);
    });

    it("rejects a word without phonemes", async () => {
        const response = await createWord(
            jsonRequest(
                "/api/word-lists/list/words",
                "POST",
                {
                    english: "empty",
                    ipa: "/empti/",
                    phonemes: [],
                },
            ),
            listContext(),
        );

        await expectApiError(
            response,
            400,
            "VALIDATION_ERROR",
        );

        expect(databaseMocks.getDatabase)
            .not.toHaveBeenCalled();
    });

    it("returns 409 for a duplicate word", async () => {
        databaseMocks.wordCreate.mockRejectedValue(
            prismaError("P2002"),
        );

        const response = await createWord(
            jsonRequest(
                "/api/word-lists/list/words",
                "POST",
                WORD_INPUT,
            ),
            listContext(),
        );

        await expectApiError(
            response,
            409,
            "WORD_CONFLICT",
        );
    });

    it("returns 404 for a missing word", async () => {
        databaseMocks.wordFindUnique
            .mockResolvedValue(null);

        const response = await getWord(
            new Request(
                `http://localhost/api/words/${WORD_ID}`,
            ),
            wordContext(),
        );

        await expectApiError(
            response,
            404,
            "WORD_NOT_FOUND",
        );
    });

    it("atomically replaces the phoneme sequence", async () => {
        databaseMocks.wordUpdate.mockResolvedValue(
            WORD_RECORD,
        );

        const response = await updateWord(
            jsonRequest(
                `/api/words/${WORD_ID}`,
                "PATCH",
                {
                    phonemes: WORD_INPUT.phonemes,
                },
            ),
            wordContext(),
        );

        expect(response.status).toBe(200);

        const updateArguments =
            databaseMocks.wordUpdate.mock.calls[0][0];

        expect(
            updateArguments.data.phonemes.deleteMany,
        ).toEqual({});

        expect(
            updateArguments.data.phonemes.create.map(
                ({
                    position,
                }: {
                    position: number;
                }) => position,
            ),
        ).toEqual([
            0,
            1,
            2,
        ]);
    });

    it("returns 404 when updating a missing word", async () => {
        databaseMocks.wordUpdate.mockRejectedValue(
            prismaError("P2025"),
        );

        const response = await updateWord(
            jsonRequest(
                `/api/words/${WORD_ID}`,
                "PATCH",
                {
                    ipa: "/updated/",
                },
            ),
            wordContext(),
        );

        await expectApiError(
            response,
            404,
            "WORD_NOT_FOUND",
        );
    });

    it("deletes an unused word", async () => {
        databaseMocks.wordDelete.mockResolvedValue(
            WORD_RECORD,
        );

        const response = await deleteWord(
            new Request(
                `http://localhost/api/words/${WORD_ID}`,
                {
                    method: "DELETE",
                },
            ),
            wordContext(),
        );

        expect(response.status).toBe(204);
        await expect(response.text()).resolves.toBe("");
    });

    it("returns 409 when a saved Wordle uses the word", async () => {
        databaseMocks.wordDelete.mockRejectedValue(
            prismaError("P2003"),
        );

        const response = await deleteWord(
            new Request(
                `http://localhost/api/words/${WORD_ID}`,
                {
                    method: "DELETE",
                },
            ),
            wordContext(),
        );

        await expectApiError(
            response,
            409,
            "WORD_IN_USE",
        );
    });

    it("rejects an invalid word UUID", async () => {
        const response = await getWord(
            new Request(
                "http://localhost/api/words/invalid",
            ),
            wordContext("invalid"),
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