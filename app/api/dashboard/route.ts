import { ActivityType, GenerationOutcome, MetricSource } from "@/build/generated/prisma/client";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { getDatabase } from "@/lib/database/client";
import { toRuntimeDifficulty } from "@/lib/database/configuration-mappers";
import type { DashboardActivitySummary, DashboardActivityType, DashboardData } from "@/lib/types";

// Route needs node js cause it connects to postgresql.
export const runtime = "nodejs";
// Always calculate current dashboard info, don't return an old saved response.
export const dynamic = "force-dynamic";

// The activity types that appear in the dashboard, even if there are not generation attempts.
const ACTIVITY_TYPES = [
    ActivityType.WORDLE,
    ActivityType.WORD_SEARCH,
] as const;

// Only these two builder pages are included in time-on-page reports.
const PAGE_PATHS = [
    "/wordle",
    "/word-search",
] as const;

// Converts a database activity name into the simpler name, returned by the dashboard API.
function toPublicActivityType(
    activityType: ActivityType,
): DashboardActivityType {
    return activityType ===
        ActivityType.WORDLE
        ? "wordle"
        : "word-search";
}

// Calculates the percentage of successful attempts. Null when not attempts exist
function percentage(
    successCount: number,
    failureCount: number,
): number | null {
    const total = successCount + failureCount;

    return total === 0
        ? null
        : Math.round(
            (successCount / total) * 100,
        );
}

// Gets current content, activity, configuration, and usage statistics for the dashboard.
export async function GET(): Promise<Response> {
    try {
        const database = getDatabase();

        // These database requests don't depend on each other, so they start togehter to reduce wait time
        // The order of results (consts) must match the order of the database.xxx requests below.
        const [
            wordListCount,
            wordCount,
            phonemeCount,
            emptyWordListCount,
            wordleCreatedCount,
            wordSearchCreatedCount,
            generationGroups,
            pageAggregate,
            pageGroups,
            generationSourceGroups,
            pageSourceGroups,
            recentWordleConfigurations,
            recentWordSearchConfigurations,
        ] = await Promise.all([
            database.wordList.count(),
            database.word.count(),
            database.wordPhoneme.count(),
            database.wordList.count({
                where: {
                    words: {
                        none: {},
                    },
                },
            }),
            database.wordleConfiguration.count(),
            database.wordSearchConfiguration.count(),
            database.activityGeneration.groupBy({
                by: [
                    "activityType",
                    "outcome",
                ],
                _count: {
                    _all: true,
                },
            }),
            database.pageView.aggregate({
                _avg: {
                    durationMs: true,
                },
                _count: {
                    _all: true,
                },
            }),
            database.pageView.groupBy({
                by: ["path"],
                _avg: {
                    durationMs: true,
                },
                _count: {
                    _all: true,
                },
            }),
            database.activityGeneration.groupBy({
                by: ["source"],
                _count: {
                    _all: true,
                },
            }),
            database.pageView.groupBy({
                by: ["source"],
                _count: {
                    _all: true,
                },
            }),
            // Load the six most recently updated Wordle setups.
            database.wordleConfiguration.findMany({
                take: 6,
                orderBy: {
                    updatedAt: "desc",
                },
                select: {
                    id: true,
                    name: true,
                    difficulty: true,
                    updatedAt: true,
                },
            }),
             // Load the six most recently updated word-search setups.
            database.wordSearchConfiguration.findMany({
                take: 6,
                orderBy: {
                    updatedAt: "desc",
                },
                select: {
                    id: true,
                    name: true,
                    difficulty: true,
                    updatedAt: true,
                },
            }),
        ]);
        // Build one dashboard summary for Wordle and another for Word Search.
        const activities: DashboardActivitySummary[] =
            ACTIVITY_TYPES.map(
                (activityType) => {

                    // Find the successful generation total for this activity, if not records then 0
                    const successfulGenerationCount = generationGroups.find(
                        (group) =>
                            group.activityType === activityType &&
                            group.outcome === GenerationOutcome.SUCCESS,
                    )?._count._all ?? 0;

                    // Find the failed generation total for this activity.
                    const failedGenerationCount = generationGroups.find(
                        (group) =>
                            group.activityType === activityType &&
                            group.outcome === GenerationOutcome.FAILURE,
                    )?._count._all ?? 0;

                    return {
                        activityType: toPublicActivityType(activityType,),
                        createdCount:
                            activityType ===
                                ActivityType.WORDLE
                                ? wordleCreatedCount
                                : wordSearchCreatedCount,
                        successfulGenerationCount,
                        failedGenerationCount,
                        successRate: percentage(
                            successfulGenerationCount,
                            failedGenerationCount,
                        ),
                    };
                },
            );

        // Add the successful totals from both activities.
        const generatedOutputCount =
            activities.reduce(
                (total, activity) =>
                    total + activity.successfulGenerationCount, 0,
            );

        // Add the failed totals from both activities.
        const failedGenerationCount =
            activities.reduce(
                (total, activity) =>
                    total + activity.failedGenerationCount, 0,
            );
        // Calculate the total number of generation attempts for each activity, then place most used activity first.
        const usageOrder = [...activities].map((activity) => ({
            activityType: activity.activityType,
            count: activity.successfulGenerationCount + activity.failedGenerationCount,
        })).sort(
            (left, right) => right.count - left.count,
        );

        const mostUsedActivity = usageOrder[0];

        const mostUsedActivityType =
            mostUsedActivity &&
                mostUsedActivity.count > 0
                ? mostUsedActivity.activityType
                : null;

        // Builds a page-time summary for both builder pages.
        const pageAverages =
            PAGE_PATHS.map((path) => {
                const group =
                    pageGroups.find(
                        (candidate) =>
                            candidate.path ===
                            path,
                    );

                return {
                    path,
                    // Use zero when this page has no recorded visits.
                    viewCount:
                        group?._count._all ??
                        0,
                    // Duration is stored as MS in DB, divide by 1K to return seconds
                    averageSeconds:
                        group?._avg.durationMs ==
                        null
                            ? null
                            : Number(
                                (
                                    group._avg
                                        .durationMs /
                                    1_000
                                ).toFixed(1),
                            ),
                };
            });

        // Add the generation and page-view totals for one source.
        // This is used to show how much dashboard data came from
        // real use and how much came from simulated seed records.
        const sourceCount = (
            source: MetricSource,
        ) =>
        (
            generationSourceGroups.find(
                (group) =>
                    group.source === source,
            )?._count._all ?? 0
        ) +
        (
            pageSourceGroups.find(
                (group) =>
                    group.source === source,
            )?._count._all ?? 0
        );

        // Give Wordle and Word Search configurations the same shape, so they can appear together in on recent activity list.
        const recentConfigurations = [
            ...recentWordleConfigurations.map(
                (configuration) => ({
                    id:  configuration.id,
                    name: configuration.name,
                    activityType: "wordle" as const,
                    difficulty: toRuntimeDifficulty(configuration.difficulty,),
                    updatedAt: configuration.updatedAt.toISOString(),
                }),
            ),
            ...recentWordSearchConfigurations.map(
                (configuration) => ({
                    id:  configuration.id,
                    name: configuration.name,
                    activityType: "word-search" as const,
                    difficulty: toRuntimeDifficulty(configuration.difficulty,),
                    updatedAt: configuration.updatedAt.toISOString(),
                }),
            ),
        ] // most recent updated first
            .sort((left, right) =>
                right.updatedAt.localeCompare(
                    left.updatedAt,
                ),
            )
            // Only return 6 setups for both activities
            .slice(0, 6);

        // Combine all calculated values into the public dashboard response.
        const data: DashboardData = {
            wordListCount,
            wordCount,
            phonemeCount,
            emptyWordListCount,
            generatedOutputCount,
            failedGenerationCount,
            averageTimeOnPageSeconds:
                pageAggregate._avg.durationMs ==
                null
                    ? null
                    : Number(
                        (pageAggregate._avg.durationMs / 1_000).toFixed(1),
                    ),
                        mostUsedActivityType,
            activities,
            pageAverages,
            recentConfigurations,
            // Clearly separate real usage from simulated records.
            recordSources: {
                live: sourceCount(MetricSource.LIVE,),
                simulated: sourceCount(MetricSource.SIMULATED),
            },
            generatedAt: new Date().toISOString(),
        };

        return successResponse(data);
    } catch (error) {
        console.error(
            "Unable to load dashboard statistics.", error,
        );

        // Return a clear message without exposing database details.
        return errorResponse(
            "DASHBOARD_UNAVAILABLE",
            "Dashboard statistics could not be loaded.",
            500
        );
    }
}