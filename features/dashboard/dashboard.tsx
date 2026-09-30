"use client";

import Link from "next/link";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { readApiData, } from "@/lib/api/client";
import type { DashboardActivityType, DashboardData, HealthStatusData, } from "@/lib/types";

function activityLabel(
    activityType: DashboardActivityType | null,
): string {
    if (activityType === "wordle") {
        return "Wordle";
    }

    if (activityType === "word-search") {
        return "Word Search";
    }

    return "No usage recorded"
}

function formatSeconds(
    seconds: number | null,
): string {
    return seconds === null
        ? "No data"
        : `${seconds.toFixed(1)} seconds`;
}
// Operational Warning colours based on count, e.g. more than 2 failed generations colour = orange.
function warningTextColour(
    count: number,
): string {
    if (count > 5) {
        return "text-(--danger)";
    }

    if (count > 2) {
        return "text-(--warning)";
    }

    return "text-foreground";
}

// Displays one dashboard value with supporting text.
function SummaryCard({
    label,
    value,
    description,
}: {
    readonly label: string;
    readonly value: string | number;
    readonly description: string;
}) {
    return (
        <article className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-(--muted-text)">
                {label}
            </p>

            <p className="mt-2 text-3xl font-bold text-(--accent)">
                {value}
            </p>

            <p className="mt-2 text-sm text-(--muted-text)">
                {description}
            </p>
        </article>
    );
}
// Displays the dashboard and keeps its data updated.
export function Dashboard() {
    // Stores the dashboard statistics returned by the server.
    const [data, setData] = useState<DashboardData | null>(null,);

    // Database health
    const [health, setHeath] = useState<HealthStatusData | null>(null,);

    // Error message when dashboard loading fails.
    const [errorMessage, setErrorMessage] = useState("");

    const [isRefreshing, setIsRefreshing] = useState(true);

    // Keeps track of the current request so an older request can be cancelled.
    const requestController = useRef<AbortController | null>(null,);

    // Loads the latest dashboard and health information.
    const loadDashboard = useCallback(
        async () => {
            requestController.current?.abort();

            const controller = new AbortController();
            requestController.current = controller;

            setIsRefreshing(true);
            setErrorMessage("");

            // Requests the latest dashboard statistics.
            const dashboardRequest = fetch(
                "/api/dashboard",
                {
                    cache: "no-store",
                    signal: controller.signal,
                },
            ).then((response) =>
                readApiData<DashboardData>(
                    response,
                    "Dashboard statistics could not be loaded.",
                ),
            );

            // Requests the current application and database health.
            const healthRequest = fetch(
                "/health",
                {
                    cache: "no-store",
                    signal: controller.signal,
                },
            ).then((response) =>
                readApiData<HealthStatusData>(
                    response,
                    "Health status could not be loaded.",
                ),
            );

            // Waits for both requests, even if one of them fails.
            const [
                dashboardResult,
                healthResult,
            ] = await Promise.allSettled([
                dashboardRequest,
                healthRequest,
            ]);

            // Ignores the results if this request was cancelled.
            if (controller.signal.aborted) {
                return;
            }

            setHeath(
                healthResult.status ===
                    "fulfilled"
                    ? healthResult.value
                    : null,
            );

            // Stores either the dashboard data or its error message.
            if (dashboardResult.status === "rejected") {
                setErrorMessage(
                    dashboardResult.reason
                        instanceof Error
                        ? dashboardResult.reason.message
                        : "Dashboard statistics could not be loaded."
                );
            } else {
                setData(
                    dashboardResult.value,
                );
            }

            setIsRefreshing(false);
        },
        [],
    );

    // Loads the dashboard immediately and refreshes it every 30 seconds.
    useEffect(() => {
        void loadDashboard();

        const interval = window.setInterval(
            () => {
                void loadDashboard();
            },
            30_000,
        );

        return () => {
            window.clearInterval(interval);
            requestController.current?.abort();
        };
    }, [loadDashboard]);
    // Show a loading message before any dashboard data is available.
    if (!data && isRefreshing) {
        return (
            <p
                role="status"
                className="mt-12 rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing)"
            >
                Loading operational statistics…
            </p>
        );
    }

    // Shows an error and retry button if the first load failed.
    if (!data) {
        return (
            <section
                role="alert"
                className="mt-12 rounded-2xl border border-(--danger) bg-(--surface) p-(--panel-spacing)"
            >
                <h2 className="text-xl font-semibold">
                    Dashboard unavailable
                </h2>

                <p className="mt-2 text-(--danger)">
                    {errorMessage}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        void loadDashboard()
                    }
                    className="mt-5 rounded-lg bg-(--action) px-4 py-2 font-semibold text-(--action-text) hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                    Try again
                </button>
            </section>
        );
    }

    // Combines empty word lists and failed generations into one warning total.
    const warningCount =
        data.emptyWordListCount +
        data.failedGenerationCount;

    return (
        <div
            className="mt-12 space-y-(--panel-spacing)"
            aria-busy={isRefreshing}
        >
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-(--muted-text)">
                        System health
                    </p>

                    <p
                        className={`mt-2 font-semibold ${health
                            ? "text-(--success)"
                            : "text-(--danger)"
                            }`}
                        role="status"
                    >
                        {health
                            ? "Healthy: PostgreSQL connected"
                            : "Unavailable: check the application and database"}
                    </p>

                    <p className="mt-2 text-sm text-(--muted-text)">
                        Last updated{" "}
                        <time
                            dateTime={
                                data.generatedAt
                            }
                        >
                            {new Date(
                                data.generatedAt,
                            ).toLocaleTimeString(
                                "en-AU",
                            )}
                        </time>
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isRefreshing}
                    onClick={() =>
                        void loadDashboard()
                    }
                    className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-wait disabled:opacity-60"
                >
                    {isRefreshing
                        ? "Refreshing…"
                        : "Refresh dashboard"}
                </button>
            </section>

            {errorMessage ? (
                <p
                    role="alert"
                    className="rounded-xl border border-(--danger) bg-(--surface) p-4 text-(--danger)"
                >
                    {errorMessage}
                </p>
            ) : null}

            <section
                aria-labelledby="dashboard-summary-heading"
            >
                <h2
                    id="dashboard-summary-heading"
                    className="text-2xl font-semibold"
                >
                    Operational summary
                </h2>

                <div className="mt-5 grid gap-(--control-spacing) sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Word lists"
                        value={data.wordListCount}
                        description={`${data.wordCount} stored words and ${data.phonemeCount} phoneme records.`}
                    />
                    <SummaryCard
                        label="Generated outputs"
                        value={
                            data.generatedOutputCount
                        }
                        description="Successful Wordle and Word Search previews."
                    />
                    <SummaryCard
                        label="Average builder time"
                        value={formatSeconds(
                            data.averageTimeOnPageSeconds,
                        )}
                        description="Active visible time on the two builders."
                    />
                    <SummaryCard
                        label="Most-used activity"
                        value={activityLabel(
                            data.mostUsedActivityType,
                        )}
                        description="Based on recorded generation attempts."
                    />
                </div>
            </section>

            <section
                aria-labelledby="activity-report-heading"
                className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
            >
                <h2
                    id="activity-report-heading"
                    className="text-2xl font-semibold"
                >
                    Activity report
                </h2>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-160 border-collapse text-left">
                        <caption className="sr-only">
                            Stored configurations and generation outcomes by activity type
                        </caption>
                        <thead>
                            <tr className="border-b border-(--border)">
                                <th className="px-3 py-3">
                                    Activity
                                </th>
                                <th className="px-3 py-3">
                                    Saved
                                </th>
                                <th className="px-3 py-3">
                                    Successful
                                </th>
                                <th className="px-3 py-3">
                                    Failed
                                </th>
                                <th className="px-3 py-3">
                                    Success rate
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.activities.map(
                                (activity) => (
                                    <tr
                                        key={
                                            activity.activityType
                                        }
                                        className="border-b border-(--border) font-semibold"
                                    >
                                        <th
                                            scope="row"
                                            className="px-3 py-3 "
                                        >
                                            {activityLabel(
                                                activity.activityType,
                                            )}
                                        </th>
                                        <td className="px-3 py-3 font-semibold">
                                            {
                                                activity.createdCount
                                            }
                                        </td>
                                        <td className="px-3 py-3 font-semibold text-(--success)">
                                            {
                                                activity.successfulGenerationCount
                                            }
                                        </td>
                                        <td className="px-3 py-3 font-semibold text-(--danger)">
                                            {
                                                activity.failedGenerationCount
                                            }
                                        </td>
                                        <td className="px-3 py-3 font-semibold">
                                            {activity.successRate ===
                                                null
                                                ? "No data"
                                                : `${activity.successRate}%`}
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="grid gap-(--panel-spacing) lg:grid-cols-2">
                <section
                    aria-labelledby="builder-time-heading"
                    className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                >
                    <h2
                        id="builder-time-heading"
                        className="text-xl font-semibold"
                    >
                        Builder time
                    </h2>

                    <dl className="mt-5 space-y-4">
                        {data.pageAverages.map(
                            (pageAverage) => (
                                <div
                                    key={
                                        pageAverage.path
                                    }
                                    className="flex items-start justify-between gap-4 border-b border-(--border) pb-4"
                                >
                                    <div>
                                        <dt className="font-semibold">
                                            {pageAverage.path ===
                                                "/wordle"
                                                ? "Wordle"
                                                : "Word Search"}
                                        </dt>
                                        <dd className="text-sm text-(--muted-text)">
                                            {
                                                pageAverage.viewCount
                                            }{" "}
                                            recorded visits
                                        </dd>
                                    </div>
                                    <dd className="font-semibold">
                                        {formatSeconds(
                                            pageAverage.averageSeconds,
                                        )}
                                    </dd>
                                </div>
                            ),
                        )}
                    </dl>
                </section>

                <section
                    aria-labelledby="warnings-heading"
                    className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                >
                    <h2
                        id="warnings-heading"
                        className="text-xl font-semibold"
                    >
                        Operational warnings
                    </h2>

                    {warningCount === 0 ? (
                        <p className="mt-5 text-(--success)">
                            No unusual states are currently recorded.
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {data.emptyWordListCount > 0 ? (
                                <li
                                    className="flex items-center justify-between gap-4 border-b border-(--border) pb-2 font-semibold"
                                >
                                    <span className={warningTextColour(data.emptyWordListCount)}>
                                        Empty word lists
                                    </span>

                                    <span className={warningTextColour(data.emptyWordListCount)}>
                                        {
                                            data.emptyWordListCount
                                        }
                                    </span>
                                </li>
                            ) : null}

                            {data.failedGenerationCount > 0 ? (
                                <li
                                    className="flex items-center justify-between gap-4 border-b border-(--border) pb-2 font-semibold"
                                >
                                    <span className={warningTextColour(data.failedGenerationCount)}>
                                        Failed generations
                                    </span>

                                    <span className={warningTextColour(data.failedGenerationCount)}>
                                        {
                                            data.failedGenerationCount
                                        }
                                    </span>
                                </li>
                            ) : null}
                        </ul>
                    )}
                </section>
            </div>

            <section
                aria-labelledby="recent-configurations-heading"
                className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
            >
                <h2
                    id="recent-configurations-heading"
                    className="text-xl font-semibold"
                >
                    Recently updated configurations
                </h2>

                {data.recentConfigurations.length ===
                    0 ? (
                    <p className="mt-4 text-(--muted-text)">
                        No saved configurations yet.
                    </p>
                ) : (
                    <ul className="mt-5 divide-y divide-(--border)">
                        {data.recentConfigurations.map(
                            (configuration) => (
                                <li
                                    key={
                                        configuration.id
                                    }
                                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {
                                                configuration.name
                                            }
                                        </p>
                                        <p className="text-sm capitalize text-(--muted-text)">
                                            {activityLabel(
                                                configuration.activityType,
                                            )}
                                            {": "}
                                            {
                                                configuration.difficulty
                                            }
                                        </p>
                                    </div>

                                    <Link
                                        href={
                                            configuration.activityType ===
                                                "wordle"
                                                ? "/wordle"
                                                : "/word-search"
                                        }
                                        className="font-semibold text-(--accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
                                    >
                                        Open builder
                                    </Link>
                                </li>
                            ),
                        )}
                    </ul>
                )}
            </section>

            <aside className="rounded-xl border border-(--border) bg-(--surface-muted) p-4 text-sm text-(--muted-text)">
                Reporting totals currently combine{" "}
                <strong>
                    {data.recordSources.simulated}
                </strong>{" "}
                labelled simulated records and{" "}
                <strong>
                    {data.recordSources.live}
                </strong>{" "}
                live records. Simulated records are replaced on each seed; live records are preserved.
            </aside>
        </div>
    );
}