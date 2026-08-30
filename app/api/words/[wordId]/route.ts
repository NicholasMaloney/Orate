import {
    errorResponse,
    noContentResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    parseJsonRequest,
    updateWordSchema,
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

interface WordRouteContext {
    readonly params: Promise<{
        readonly wordId: string;
    }>;
}

// Resolves and validates the asynchronous word identifier.
async function readWordId(
    context: WordRouteContext,
): Promise<JsonValidationResult<string>> {
    const { wordId } = await context.params;
    const validation = uuidSchema.safeParse(wordId);

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

// Returns one word with its ordered phoneme sequence.
export async function GET(
    _request: Request,
    context: WordRouteContext,
): Promise<Response> {
    const wordId = await readWordId(context);

    if (!wordId.success) {
        return wordId.response;
    }

    try {
        const database = getDatabase();

        const word = await database.word.findUnique({
            where: {
                id: wordId.data,
            },
            select: WORD_WITH_PHONEMES_SELECT,
        });

        if (!word) {
            return errorResponse(
                "WORD_NOT_FOUND",
                "Word not found.",
                404,
            );
        }

        return successResponse(word);
    } catch (error) {
        console.error(
            "Unable to load word.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load the word.",
            500,
        );
    }
}

// Updates word fields and optionally replaces every phoneme token.
export async function PATCH(
    request: Request,
    context: WordRouteContext,
): Promise<Response> {
    const wordId = await readWordId(context);

    if (!wordId.success) {
        return wordId.response;
    }

    const validation = await parseJsonRequest(
        request,
        updateWordSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    const {
        phonemes,
        ...wordFields
    } = validation.data;

    try {
        const database = getDatabase();

        const updatedWord =
            await database.word.update({
                where: {
                    id: wordId.data,
                },
                data: {
                    ...wordFields,
                    ...(phonemes
                        ? {
                            phonemes: {
                                // Nested writes replace the sequence atomically.
                                deleteMany: {},
                                create: phonemes.map(
                                    (
                                        phoneme,
                                        position,
                                    ) => ({
                                        ...phoneme,
                                        position,
                                    }),
                                ),
                            },
                        }
                        : {}),
                },
                select:
                    WORD_WITH_PHONEMES_SELECT,
            });

        return successResponse(updatedWord);
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_NOT_FOUND",
                "Word not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORD_CONFLICT",
                "This word already exists in the word list.",
                409,
            );
        }

        console.error(
            "Unable to update word.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to update the word.",
            500,
        );
    }
}

// Deletes the word and its phonemes unless a saved Wordle uses it.
export async function DELETE(
    _request: Request,
    context: WordRouteContext,
): Promise<Response> {
    const wordId = await readWordId(context);

    if (!wordId.success) {
        return wordId.response;
    }

    try {
        const database = getDatabase();

        await database.word.delete({
            where: {
                id: wordId.data,
            },
        });

        return noContentResponse();
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_NOT_FOUND",
                "Word not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2003")) {
            return errorResponse(
                "WORD_IN_USE",
                "The word cannot be deleted while a saved Wordle uses it.",
                409,
            );
        }

        console.error(
            "Unable to delete word.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to delete the word.",
            500,
        );
    }
}