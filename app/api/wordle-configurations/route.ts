// Adds the Wordle configuration collection route 
    // List saved configurations: GET /api/wordle-configurations 
    // Validate and create one configuration: POST /api/wordle-configurations
import { errorResponse, successResponse } from "@/lib/api/responses";
import { createWordleConfigurationSchema, parseJsonRequest } from "@/lib/api/validation";
import { mapWordleConfiguration, toDatabaseDifficulty } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { hasPrismaErrorCode } from "@/lib/database/errors";
import { WORDLE_CONFIGURATION_SELECT } from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns saved configurations in predictable display order.
export async function GET(): Promise<Response> {
    try {
        const configurations =
            await getDatabase()
                .wordleConfiguration
                .findMany({
                    orderBy: {
                        name: "asc",
                    },
                    select:
                        WORDLE_CONFIGURATION_SELECT,
                });

        return successResponse(
            configurations.map(
                mapWordleConfiguration,
            ),
        );
    } catch (error) {
        console.error(
            "Unable to load Wordle configurations.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load Wordle configurations.",
            500,
        );
    }
}

// Validates and stores one reusable Wordle setup.
export async function POST(
    request: Request,
): Promise<Response> {
    const validation = await parseJsonRequest(
        request,
        createWordleConfigurationSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    const {
        difficulty,
        ...fields
    } = validation.data;

    try {
        const createdConfiguration =
            await getDatabase()
                .wordleConfiguration
                .create({
                    data: {
                        ...fields,
                        difficulty:
                            toDatabaseDifficulty(
                                difficulty,
                            ),
                    },
                    select:
                        WORDLE_CONFIGURATION_SELECT,
                });

        return successResponse(
            mapWordleConfiguration(
                createdConfiguration,
            ),
            201,
        );
    } catch (error) {
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
            "Unable to create a Wordle configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to create the Wordle configuration.",
            500,
        );
    }
}