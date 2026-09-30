"use client";

import { useEffect } from "react";
import {recordMetric} from "@/features/metrics/metric-client";

// This hook records whether each distinct Wordle or Word Search builder configuration generated successfully or failed, once per browser session

// info needed to identify and record a generation attempt 
interface GenerationMetricOptions {
    readonly activityType: 
        | "wordle"
        | "word-search";
    readonly generationKey: 
        string | null;
    readonly outcome:
        | "success"
        | "failure"
        | null;
    readonly message?: string;
}

// An in-memory record as a fallback when session storage is unavailable.
const recordedKeys = new Set<string>();

// Remove a key after a failed request so the metric can be retried again. 
function removeStoredKey(key: string): void {
    recordedKeys.delete(key);

    try {
        sessionStorage.removeItem(key);
    } catch {
        // in-memory fallback avaiable 
    }
}

// check both storage locations to avoid recording the same state twice
function hasStoredKey(
    key: string,
): boolean {
    if (recordedKeys.has(key)) {
        return true;
    }

    try { 
        return (
            sessionStorage.getItem(key) === "recorded"
        );
    } catch {
        return false;
    }
}

// Store key in memory for the current browser session.
function storeKey(
    key: string,
): void {
    recordedKeys.add(key);

    try {
        sessionStorage.setItem(
            key,
            "recorded",
        );
    } catch {

    }
}

// Record each unique generated builder state once per browser session. 
export function useGenerationMetric({
    activityType,
    generationKey,
    outcome,
    message,
}: GenerationMetricOptions) {
    useEffect(() => { 
        // Only record a metric when all required values are present.
        if (
            !generationKey ||
            !outcome
        ) {
            return;
        }

        // key distinguishes the activity, result, and builder configuration.
        const storageKey =  `orate-generation:${activityType}:${outcome}:${generationKey}`;

        // Prevent recording the same metric twice in the same session.
        if (hasStoredKey(storageKey)) {
            return;
        }

        // Store the key before sending the metric to avoid duplicate metrics.
        storeKey(storageKey);

        void recordMetric({
            kind: "generation",
            activityType,
            outcome,
            ...(message
                ? { message }
                : {}),
        }).catch(() => {
            removeStoredKey(storageKey);
        });
    }, [
        activityType,
        generationKey,
        outcome,
        message,
    ]);
}