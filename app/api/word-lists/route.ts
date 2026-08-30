import {
    errorResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    createWordListSchema,
    parseJsonRequest,
} from "@/lib/api/validation";
import { getDatabase } from "@/lib/database/client";
import { hasPrismaErrorCode } from "@/lib/database/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns every word list with its current number of words.
export async function GET(): Promise<Response> {
    try {
        const database = getDatabase();

        const wordLists =
            await database.wordList.findMany({
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            words: true,
                        },
                    },
                },
            });

        const data = wordLists.map(
            ({ _count, ...wordList }) => ({
                ...wordList,
                wordCount: _count.words,
            }),
        );

        return successResponse(data);
    } catch (error) {
        console.error(
            "Unable to load word lists.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load word lists.",
            500,
        );
    }
}

// Validates and creates one teacher-managed word list.
export async function POST(
    request: Request,
): Promise<Response> {
    const validation = await parseJsonRequest(
        request,
        createWordListSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    try {
        const database = getDatabase();

        const createdWordList =
            await database.wordList.create({
                data: validation.data,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            words: true,
                        },
                    },
                },
            });

        const {
            _count,
            ...wordList
        } = createdWordList;

        return successResponse(
            {
                ...wordList,
                wordCount: _count.words,
            },
            201,
        );
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORD_LIST_NAME_CONFLICT",
                "A word list with this name already exists.",
                409,
            );
        }

        console.error(
            "Unable to create word list.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to create the word list.",
            500,
        );
    }
}