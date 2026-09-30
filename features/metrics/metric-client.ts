import { readApiData } from "@/lib/api/client";

// defines two metric formates that the client is allowed to send 
export type MetricPayload = 
    | {
        readonly kind: "generation";
        readonly activityType: 
            | "wordle"
            | "word-search"
        readonly outcome:
            | "success"
            | "failure";
        readonly message?: string;
    }
    | {
        readonly kind: "page-view";
        readonly path: 
            | "/wordle"
            | "/word-search";
        readonly durationMs: number;
    };

// Sends metric to the validated metrics API as JSON
export async function recordMetric(
    payload: MetricPayload,
): Promise<void> {
    const response = await fetch(
        "/api/metrics",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
            // Allows the request to continue when the page is closing. 
            keepalive: true,
        },
    );

    // Shared parser, unsuccessful responses produce a consistent error. 
    await readApiData<{
        readonly recorded: true;
    }>(
        response,
        "The usage metric could not be recorded."
    );
}

// Metrics are queued without delaying navigation or interrupting the teacher. 
export function queueMetric(
    payload: MetricPayload,
): void {
    const body = JSON.stringify(payload);

    // sendBeacon is preferred when browser might close the current page. 
    if (
        typeof navigator !== "undefined" && 
        navigator.sendBeacon(
            "/api/metrics", 
            new Blob([body], {
                type: "application/json",
            }),
        )
    ) {
        return;
    }

    void recordMetric(payload).catch(() => {
        // A metrics failure must not interrupt the main teacher workflow.
    })
}