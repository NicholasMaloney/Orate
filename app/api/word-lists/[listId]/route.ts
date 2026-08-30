import {
    errorResponse,
    noContentResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    parseJsonRequest,
    updateWordListSchema,
    uuidSchema,
    validationErrorResponse,
    type JsonValidationResult,
} from "@/lib/api/validation";
import { getDatabase } from "@/lib/database/client";
import { hasPrismaErrorCode } from "@/lib/database/errors";
import {
    WORD_WITH_PHONEMES_SELECT,
} from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WordListRouteContext {
    readonly params: Promise<{
        readonly listId: string;
    }>;
}

// Resolves and validates the asynchronous Next.js route parameter.
async function readWordListId(
    context: WordListRouteContext,
): Promise<JsonValidationResult<string>> {
    const { listId } = await context.params;
    const validation = uuidSchema.safeParse(listId);

    if (!validation.success) {
        return {
            success: false,
            response: validationErrorResponse(
                validation.error,
            ),
        };
    }

    return {
        success: true,
        data: validation.data,
    };
}

// Returns one list with its words and ordered phoneme tokens.
export async function GET(
    _request: Request,
    context: WordListRouteContext,
): Promise<Response> {
    const listId = await readWordListId(context);

    if (!listId.success) {
        return listId.response;
    }

    try {
        const database = getDatabase();

        const wordList =
            await database.wordList.findUnique({
                where: {
                    id: listId.data,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    words: {
                        orderBy: {
                            english: "asc",
                        },
                        select: WORD_WITH_PHONEMES_SELECT,
                    },
                },
            });

        if (!wordList) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "Word list not found.",
                404,
            );
        }

        return successResponse({
            ...wordList,
            wordCount: wordList.words.length,
        });
    } catch (error) {
        console.error(
            "Unable to load word list.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load the word list.",
            500,
        );
    }
}

// Updates the supplied fields on one existing list.
export async function PATCH(
    request: Request,
    context: WordListRouteContext,
): Promise<Response> {
    const listId = await readWordListId(context);

    if (!listId.success) {
        return listId.response;
    }

    const validation = await parseJsonRequest(
        request,
        updateWordListSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    try {
        const database = getDatabase();

        const updatedWordList =
            await database.wordList.update({
                where: {
                    id: listId.data,
                },
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
        } = updatedWordList;

        return successResponse({
            ...wordList,
            wordCount: _count.words,
        });
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "Word list not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORD_LIST_NAME_CONFLICT",
                "A word list with this name already exists.",
                409,
            );
        }

        console.error(
            "Unable to update word list.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to update the word list.",
            500,
        );
    }
}

// Deletes the list and its words unless saved activities reference them.
export async function DELETE(
    _request: Request,
    context: WordListRouteContext,
): Promise<Response> {
    const listId = await readWordListId(context);

    if (!listId.success) {
        return listId.response;
    }

    try {
        const database = getDatabase();

        await database.wordList.delete({
            where: {
                id: listId.data,
            },
        });

        return noContentResponse();
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "Word list not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2003")) {
            return errorResponse(
                "WORD_LIST_IN_USE",
                "The word list cannot be deleted while a saved activity uses it.",
                409,
            );
        }

        console.error(
            "Unable to delete word list.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to delete the word list.",
            500,
        );
    }
}