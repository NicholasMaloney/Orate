import { errorResponse, successResponse } from "@/lib/api/responses";
import { uuidSchema, validationErrorResponse, type JsonValidationResult } from "@/lib/api/validation";
import { mapWordSearchConfiguration, toDatabaseDifficulty } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { WORD_SEARCH_CONFIGURATION_SELECT } from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WordSearchConfigurationRouteContext {
    readonly params: Promise<{
        readonly configurationId: string;
    }>;
}

// Resolves and validates Next.js's asynchronous route parameter.
async function readConfigurationId(
    context: WordSearchConfigurationRouteContext,
): Promise<JsonValidationResult<string>> {
    const { configurationId } =
        await context.params;

    const validation =
        uuidSchema.safeParse(
            configurationId,
        );

    if (!validation.success) {
        return {
            success: false,
            response:
                validationErrorResponse(
                    validation.error,
                ),
        };
    }

    return {
        success: true,
        data: validation.data,
    };
}

// Returns one saved configuration and its word-list summary.
export async function GET(
    _request: Request,
    context: WordSearchConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    try {
        const configuration =
            await getDatabase()
                .wordSearchConfiguration
                .findUnique({
                    where: {
                        id: configurationId.data,
                    },
                    select:
                        WORD_SEARCH_CONFIGURATION_SELECT,
                });

        if (!configuration) {
            return errorResponse(
                "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
                "Word Search configuration not found.",
                404,
            );
        }

        return successResponse(
            mapWordSearchConfiguration(
                configuration,
            ),
        );
    } catch (error) {
        console.error(
            "Unable to load the Word Search configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load the Word Search configuration.",
            500,
        );
    }
}