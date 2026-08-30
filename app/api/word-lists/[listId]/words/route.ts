import {
    errorResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    createWordSchema,
    parseJsonRequest,
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

interface WordCollectionRouteContext {
    readonly params: Promise<{
        readonly listId: string;
    }>;
}

// Resolves and validates the parent word-list identifier.
async function readWordListId(
    context: WordCollectionRouteContext,
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

// Returns the ordered words belonging to one list.
export async function GET(
    _request: Request,
    context: WordCollectionRouteContext,
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
                    words: {
                        orderBy: {
                            english: "asc",
                        },
                        select:
                            WORD_WITH_PHONEMES_SELECT,
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

        return successResponse(wordList.words);
    } catch (error) {
        console.error(
            "Unable to load words.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load words.",
            500,
        );
    }
}

// Creates a word and its complete ordered phoneme sequence.
export async function POST(
    request: Request,
    context: WordCollectionRouteContext,
): Promise<Response> {
    const listId = await readWordListId(context);

    if (!listId.success) {
        return listId.response;
    }

    const validation = await parseJsonRequest(
        request,
        createWordSchema,
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

        const createdWord =
            await database.word.create({
                data: {
                    ...wordFields,
                    wordListId: listId.data,
                    phonemes: {
                        // Array order becomes the stored zero-based position.
                        create: phonemes.map(
                            (phoneme, position) => ({
                                ...phoneme,
                                position,
                            }),
                        ),
                    },
                },
                select:
                    WORD_WITH_PHONEMES_SELECT,
            });

        return successResponse(
            createdWord,
            201,
        );
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORD_CONFLICT",
                "This word already exists in the word list.",
                409,
            );
        }

        if (hasPrismaErrorCode(error, "P2003")) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "Word list not found.",
                404,
            );
        }

        console.error(
            "Unable to create word.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to create the word.",
            500,
        );
    }
}