/** Notes for this test case. 
 * The route tests use the real mapper but mock the database. 
 * They verify:
    - Prisma output becomes normalised activity content.
    - The route explicitly orders words.
    - An empty list is valid activity content.
    - Invalid UUIDs never open a database connection.
    - Missing resources remain distinct from invalid stored data.
    - Mapper failures receive 422.
    - Unexpected failures receive a generic 500 rather than leaking internal error details.
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const databaseMocks = vi.hoisted(() => ({
    getDatabase: vi.fn(),
    findUnique: vi.fn(),
}));

vi.mock("@/lib/database/client", () => ({
    getDatabase: databaseMocks.getDatabase,
}));

import {
    GET as getActivityWordList,
} from "@/app/api/activity-content/word-lists/[listId]/route";
import type {
    ApiErrorBody,
    ApiSuccessBody,
} from "@/lib/api/responses";
import {
    WORD_WITH_PHONEMES_SELECT,
} from "@/lib/database/selections";
import type {
    ActivityWordListData,
} from "@/lib/types";
import {
    LIST_ID,
    listContext,
    WORD_RECORD,
} from "@/tests/api/route-test-helpers";

const ACTIVITY_WORD_LIST_RECORD = {
    id: LIST_ID,
    name: "Classroom words",
    description: "Speech practice.",
    words: [WORD_RECORD],
};

async function expectApiError(
    response: Response,
    status: number,
    code: string,
    message?: string,
) {
    expect(response.status).toBe(status);

    const body =
        await response.json() as ApiErrorBody;

    expect(body).toMatchObject({
        error: {
            code,
            ...(message ? { message } : {}),
        },
    });
}

describe("activity-content API route", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        databaseMocks.getDatabase.mockReturnValue({
            wordList: {
                findUnique:
                    databaseMocks.findUnique,
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns canonical activity content", async () => {
        databaseMocks.findUnique.mockResolvedValue(
            ACTIVITY_WORD_LIST_RECORD,
        );

        const response =
            await getActivityWordList(
                new Request(
                    `http://localhost/api/activity-content/word-lists/${LIST_ID}`,
                ),
                listContext(),
            );

        const body =
            await response.json() as
                ApiSuccessBody<ActivityWordListData>;

        expect(response.status).toBe(200);

        expect(body.data.words).toEqual([
            {
                id: WORD_RECORD.id,
                english: "chin",
                ipa: "/tʃɪn/",
                phonemeIds: [
                    "ipa-74-283",
                    "ipa-26a",
                    "ipa-6e",
                ],
            },
        ]);

        expect(
            body.data.phonemes.map(
                ({ id }) => id,
            ),
        ).toEqual([
            "ipa-26a",
            "ipa-6e",
            "ipa-74-283",
        ]);

        expect(
            databaseMocks.findUnique,
        ).toHaveBeenCalledWith({
            where: {
                id: LIST_ID,
            },
            select: {
                id: true,
                name: true,
                description: true,
                words: {
                    orderBy: {
                        english: "asc",
                    },
                    select:
                        WORD_WITH_PHONEMES_SELECT,
                },
            },
        });
    });

    it("returns empty content for an empty list", async () => {
        databaseMocks.findUnique.mockResolvedValue({
            ...ACTIVITY_WORD_LIST_RECORD,
            words: [],
        });

        const response =
            await getActivityWordList(
                new Request(
                    `http://localhost/api/activity-content/word-lists/${LIST_ID}`,
                ),
                listContext(),
            );

        const body =
            await response.json() as
                ApiSuccessBody<ActivityWordListData>;

        expect(response.status).toBe(200);
        expect(body.data.words).toEqual([]);
        expect(body.data.phonemes).toEqual([]);
    });

    it("rejects an invalid UUID before querying", async () => {
        const response =
            await getActivityWordList(
                new Request(
                    "http://localhost/api/activity-content/word-lists/invalid",
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

    it("returns 404 for a missing word list", async () => {
        databaseMocks.findUnique.mockResolvedValue(
            null,
        );

        const response =
            await getActivityWordList(
                new Request(
                    `http://localhost/api/activity-content/word-lists/${LIST_ID}`,
                ),
                listContext(),
            );

        await expectApiError(
            response,
            404,
            "WORD_LIST_NOT_FOUND",
            "Word list not found.",
        );
    });

    it("returns 422 for inconsistent stored content", async () => {
        databaseMocks.findUnique.mockResolvedValue({
            ...ACTIVITY_WORD_LIST_RECORD,
            words: [
                {
                    ...WORD_RECORD,
                    phonemes: [],
                },
            ],
        });

        const response =
            await getActivityWordList(
                new Request(
                    `http://localhost/api/activity-content/word-lists/${LIST_ID}`,
                ),
                listContext(),
            );

        await expectApiError(
            response,
            422,
            "ACTIVITY_CONTENT_INVALID",
            'Word "chin" contains no phonemes.',
        );
    });

    it("returns 500 when the database query fails", async () => {
        const databaseError =
            new Error("Database unavailable.");

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(
                () => undefined,
            );

        databaseMocks.findUnique.mockRejectedValue(
            databaseError,
        );

        const response =
            await getActivityWordList(
                new Request(
                    `http://localhost/api/activity-content/word-lists/${LIST_ID}`,
                ),
                listContext(),
            );

        await expectApiError(
            response,
            500,
            "INTERNAL_SERVER_ERROR",
            "Unable to load activity content.",
        );

        expect(consoleError).toHaveBeenCalledWith(
            "Unable to load activity content.",
            databaseError,
        );
    });
});