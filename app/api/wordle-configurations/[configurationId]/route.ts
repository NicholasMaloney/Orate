import { errorResponse, noContentResponse, successResponse } from "@/lib/api/responses";
import { parseJsonRequest, updateWordleConfigurationSchema, uuidSchema, validationErrorResponse, type JsonValidationResult } from "@/lib/api/validation";
import { mapWordleConfiguration, toDatabaseDifficulty } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { WORDLE_CONFIGURATION_SELECT } from "@/lib/database/selections";
import { hasPrismaErrorCode } from "@/lib/database/errors";

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

// Updates only the configuration fields supplied by the teacher.
export async function PATCH(
    request: Request,
    context: WordleConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    const validation = await parseJsonRequest(
        request,
        updateWordleConfigurationSchema,
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
                .wordleConfiguration
                .update({
                    where: {
                        id: configurationId.data,
                    },
                    data: {
                        ...fields,

                        // Omitted difficulty must not overwrite the stored value.
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
                        WORDLE_CONFIGURATION_SELECT,
                });

        return successResponse(
            mapWordleConfiguration(
                updatedConfiguration,
            ),
        );
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORDLE_CONFIGURATION_NOT_FOUND",
                "Wordle configuration not found.",
                404,
            );
        }

        if (hasPrismaErrorCode(error, "P2002")) {
            return errorResponse(
                "WORDLE_CONFIGURATION_NAME_CONFLICT",
                "A Wordle configuration with this name already exists.",
                409,
            );
        }

        if (hasPrismaErrorCode(error, "P2003")) {
            return errorResponse(
                "WORD_NOT_FOUND",
                "The selected word does not exist.",
                404,
            );
        }

        console.error(
            "Unable to update the Wordle configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to update the Wordle configuration.",
            500,
        );
    }
}

// Deletes one saved configuration without deleting its target word.
export async function DELETE(
    _request: Request,
    context: WordleConfigurationRouteContext,
): Promise<Response> {
    const configurationId =
        await readConfigurationId(context);

    if (!configurationId.success) {
        return configurationId.response;
    }

    try {
        await getDatabase()
            .wordleConfiguration
            .delete({
                where: {
                    id: configurationId.data,
                },
            });

        return noContentResponse();
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
            return errorResponse(
                "WORDLE_CONFIGURATION_NOT_FOUND",
                "Wordle configuration not found.",
                404,
            );
        }

        console.error(
            "Unable to delete the Wordle configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to delete the Wordle configuration.",
            500,
        );
    }
}