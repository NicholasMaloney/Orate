import {
    ActivityType,
    GenerationOutcome,
    MetricSource,
} from "@/build/generated/prisma/client";
import {
    errorResponse,
    successResponse,
} from "@/lib/api/responses";
import {
    createMetricSchema,
    parseJsonRequest,
} from "@/lib/api/validation";
import { getDatabase } from "@/lib/database/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maps public request values to their database enum representations.
const ACTIVITY_TYPES = { 
    wordle: ActivityType.WORDLE,
    "word-search": ActivityType.WORD_SEARCH,
} as const;

const GENERATION_OUTCOMES = {
    success: GenerationOutcome.SUCCESS,
    failure: GenerationOutcome.FAILURE,
} as const; 

// Validates and records one live observability metric.
export async function POST(
    request: Request,
): Promise<Response> {
    const validation = await parseJsonRequest(
        request,
        createMetricSchema,
    );

    if (!validation.success) {
        return validation.response;
    }

    try {
        const database = getDatabase();

        if (validation.data.kind === "generation") {
            await database.activityGeneration.create({
                data: {
                    activityType: ACTIVITY_TYPES[validation.data.activityType],
                    outcome: GENERATION_OUTCOMES[validation.data.outcome],
                    source: MetricSource.LIVE,
                    message: validation.data.message ?? null,
                },
            });
        } else {
            await database.pageView.create({
                data: {
                    path: validation.data.path,
                    durationMs: validation.data.durationMs,
                    source: MetricSource.LIVE,
                },
            });
        }

        return successResponse({recorded:true,}, 201,);

    } catch (error) {
        console.error("Unable to record an observability metric.",error,); 
        return errorResponse(
            "METRIC_RECORDING_FAILED",
            "The metric could not be recorded.",
            500,
        );
    }
    
}