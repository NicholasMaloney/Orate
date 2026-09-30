"use client"; 

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { queueMetric } from "@/features/metrics/metric-client";


// Only tracks the two activity builder pages, /wordle and /word-search.
type TrackedPath = 
    | "/wordle"
    | "/word-search";

// Matches the 4 hour maximum duration allowed by the metrics API.
const MAX_DURATION_MS = 14_400_000;

// Type gaurd to ensure that only the two tracked paths are used for page view metrics.
function isTrackedPath(
    path: string,
): path is TrackedPath {
    return (
        path === "/wordle" ||
        path === "/word-search"
    );
}

// Measures how long a user is actively viewing either pages and record one page-view metric when the user leaves
export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Makes sure any page not tracked is not recorded - or contributes to the timing stats. 
        if (!isTrackedPath(pathname)) {
            return;
        }

        const trackedPath = pathname;

        let elapsedMs = 0;
        let sent = false; 

        // Start timer only when page is visible
        let activeSince = 
            document.visibilityState === "visible"
                ? performance.now()
                : null; 
        
        // Add the current view time to the total before pauseing. 
        function pauseTimer() { 
            if (activeSince === null) {
                return;
            }

            elapsedMs += 
                performance.now() - activeSince;
            activeSince = null;
        }

        // Resume timer when the user returns to the visible page.
        function resumeTimer() {
            if (
                activeSince === null &&
                document.visibilityState === "visible"
            ) {
                activeSince = performance.now();
            }
        }

        // Sends the metric to the API if it has not already been sent and the duration is at least 1 second.
        function sendMetric() {
            pauseTimer();

            const durationMs = Math.min(
                Math.round(elapsedMs),
                MAX_DURATION_MS,
            );

            // Don't send the metric if it has already been sent or the duration is less than 1 second.
            if (
                sent ||
                durationMs < 1_000
            ) {
                return;
            }

            sent = true;

            queueMetric({
                kind: "page-view",
                path: trackedPath,
                durationMs,
            });
        }

        // Pause the timer when the page is hidden, as user is not actively viewing, and resume when it is visible again.
        function handleVisibilityChange() {
            if (
                document.visibilityState === "hidden"
            ) {
                pauseTimer();
            } else {
                resumeTimer();
            }
        }

        // Listen for tab visibility changes and for the page being closed or replaced.
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );

        window.addEventListener(
            "pagehide",
            sendMetric,
        );

        // Remove the listeners and record the visit when the route or component changes.
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );

            window.removeEventListener(
                "pagehide",
                sendMetric,
            );

            sendMetric();
        };
    }, [pathname]);
    
    // This component performs tracking only and does not render visible content.
    return null;
}