// For future me's reference - the route: GET /api/activity-content/word-lists/[listId]
// Flow: Validate UUID -> Load lists, words, and phonemes -> map database entries to related activity IDs -> return serilised activity content
// Erros expected per situation 
    // Valid populated list	200 { data: ActivityWordListData }
    // Valid empty list	200 with empty words and phonemes
    // Invalid UUID	400 VALIDATION_ERROR
    // Missing list	404 WORD_LIST_NOT_FOUND
    // Inconsistent stored phonemes	422 ACTIVITY_CONTENT_INVALID
    // Unexpected database failure	500 INTERNAL_SERVER_ERROR
import {
    errorResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    uuidSchema,
    validationErrorResponse,
    type JsonValidationResult,
} from "@/lib/api/validation";
import {
    InvalidActivityContentError,
    mapWordListRecordToActivityData,
} from "@/lib/database/activity-mappers";
import { getDatabase } from "@/lib/database/client";
import {
    WORD_WITH_PHONEMES_SELECT,
} from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ActivityContentRouteContext {
    readonly params: Promise<{
        readonly listId: string;
    }>;
}

// Validates the route parameter before database access.
async function readWordListId(
    context: ActivityContentRouteContext,
): Promise<JsonValidationResult<string>> {
    const { listId } = await context.params;
    const validation =
        uuidSchema.safeParse(listId);

    // Return a structured validation response for invalid UUIDs.
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

// Returns activity ready content for the requested word list.
export async function GET(
    _request: Request,
    context: ActivityContentRouteContext,
): Promise<Response> {
    const listId = await readWordListId(context);

    // If router parameter is invalid stop and throw error 
    if (!listId.success) {
        return listId.response;
    }

    try {
        // Load the word list and its associated phoneme data.
        const wordList =
            await getDatabase().wordList.findUnique({
                where: {
                    id: listId.data,
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

        if (!wordList) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "Word list not found.",
                404,
            );
        }

        return successResponse(
            mapWordListRecordToActivityData(
                wordList,
            ),
        );
    } catch (error) {
        if (
            error instanceof
            InvalidActivityContentError
        ) {
            return errorResponse(
                "ACTIVITY_CONTENT_INVALID",
                error.message,
                422,
            );
        }

        console.error(
            "Unable to load activity content.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load activity content.",
            500,
        );
    }
}