// Quick note for future me:
// Word Search configuration collection:
    // Sorted saved configurations: GET/api/word-search-configurations
    // Validated configuration with 201: POST/api/word-search-configurations
// Only difficulty needs transformation because its public and database representations differ.

import { errorResponse, successResponse } from "@/lib/api/responses";
import { createWordSearchConfigurationSchema, parseJsonRequest } from "@/lib/api/validation";
import { mapWordSearchConfiguration, toDatabaseDifficulty } from "@/lib/database/configuration-mappers";
import { getDatabase } from "@/lib/database/client";
import { hasPrismaErrorCode } from "@/lib/database/errors";
import { WORD_SEARCH_CONFIGURATION_SELECT } from "@/lib/database/selections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns saved configurations in predictable display order.
export async function GET(): Promise<Response> {
    try {
        const configurations =
            await getDatabase()
                .wordSearchConfiguration
                .findMany({
                    orderBy: {
                        name: "asc",
                    },
                    select:
                        WORD_SEARCH_CONFIGURATION_SELECT,
                });

        return successResponse(
            configurations.map(
                mapWordSearchConfiguration,
            ),
        );
    } catch (error) {
        console.error(
            "Unable to load Word Search configurations.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to load Word Search configurations.",
            500,
        );
    }
}

// Validates and stores one reusable Word Search setup.
export async function POST(
    request: Request,
): Promise<Response> {
    const validation = await parseJsonRequest(
        request,
        createWordSearchConfigurationSchema,
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
                .wordSearchConfiguration
                .create({
                    data: {
                        ...fields,
                        difficulty:
                            toDatabaseDifficulty(
                                difficulty,
                            ),
                    },
                    select:
                        WORD_SEARCH_CONFIGURATION_SELECT,
                });

        return successResponse(
            mapWordSearchConfiguration(
                createdConfiguration,
            ),
            201,
        );
    } catch (error) {
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
            "Unable to create a Word Search configuration.",
            error,
        );

        return errorResponse(
            "INTERNAL_SERVER_ERROR",
            "Unable to create the Word Search configuration.",
            500,
        );
    }
}