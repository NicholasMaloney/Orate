import { errorResponse, successResponse } from "@/lib/api/responses";
import { uuidSchema, validationErrorResponse, type JsonValidationResult } from "@/lib/api/validation";
import { mapWordleConfiguration } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { WORDLE_CONFIGURATION_SELECT } from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WordleConfigurationRouteContext {
    readonly params: Promise<{
        readonly configurationId: string;
    }>;
}

// Resolves and validates Next.js's asynchronous route parameter.
async function readConfigurationId(
    context: WordleConfigurationRouteContext,
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

// Returns one saved Wordle configuration and its target.
export async function GET(
    _request: Request,
    context: WordleConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    try {
        const configuration =
            await getDatabase()
                .wordleConfiguration
                .findUnique({
                    where: {
                        id: configurationId.data,
                    },
                    select:
                        WORDLE_CONFIGURATION_SELECT,
                });

        if (!configuration) {
            return errorResponse(
                "WORDLE_CONFIGURATION_NOT_FOUND",
                "Wordle configuration not found.",
                404,
            );
        }

        return successResponse(
            mapWordleConfiguration(
                configuration,
            ),
        );
    } catch (error) {
        console.error(
            "Unable to load the Wordle configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load the Wordle configuration.",
            500,
        );
    }
}