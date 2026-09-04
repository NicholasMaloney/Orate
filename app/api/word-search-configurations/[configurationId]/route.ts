import { errorResponse, noContentResponse, successResponse } from "@/lib/api/responses";
import { parseJsonRequest, updateWordSearchConfigurationSchema, uuidSchema, validationErrorResponse, type JsonValidationResult } from "@/lib/api/validation";
import { mapWordSearchConfiguration, toDatabaseDifficulty } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { WORD_SEARCH_CONFIGURATION_SELECT } from "@/lib/database/selections";
import { hasPrismaErrorCode } from "@/lib/database/errors";

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

// Updates only the configuration fields supplied by the teacher.
export async function PATCH(
    request: Request,
    context: WordSearchConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    const validation = await parseJsonRequest(
        request,
        updateWordSearchConfigurationSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    const {
        difficulty,
        ...fields
    } = validation.data;

    try {
        const updatedConfiguration =
            await getDatabase()
                .wordSearchConfiguration
                .update({
                    where: {
                        id: configurationId.data,
                    },
                    data: {
                        ...fields,

                        // Omitted difficulty leaves the stored value unchanged.
                        ...(difficulty === undefined
                            ? {}
                            : {
                                difficulty:
                                    toDatabaseDifficulty(
                                        difficulty,
                                    ),
                            }),
                    },
                    select:
                        WORD_SEARCH_CONFIGURATION_SELECT,
                });

        return successResponse(
            mapWordSearchConfiguration(
                updatedConfiguration,
            ),
        );
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
                "Word Search configuration not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORD_SEARCH_CONFIGURATION_NAME_CONFLICT",
                "A Word Search configuration with this name already exists.",
                409,
            );
        }

        if (hasPrismaErrorCode(error, "P2003")) {
            return errorResponse(
                "WORD_LIST_NOT_FOUND",
                "The selected word list does not exist.",
                404,
            );
        }

        console.error(
            "Unable to update the Word Search configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to update the Word Search configuration.",
            500,
        );
    }
}

// Deletes the saved setup without deleting its word list.
export async function DELETE(
    _request: Request,
    context: WordSearchConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    try {
        await getDatabase()
            .wordSearchConfiguration
            .delete({
                where: {
                    id: configurationId.data,
                },
            });

        return noContentResponse();
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORD_SEARCH_CONFIGURATION_NOT_FOUND",
                "Word Search configuration not found.",
                404,
            );
        }

        console.error(
            "Unable to delete the Word Search configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to delete the Word Search configuration.",
            500,
        );
    }
}