"use client";

import {
    useEffect,
    useState,
} from "react";

import type {
    ApiSuccessBody,
} from "@/lib/api/responses";

interface WordListSummary {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly wordCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
}

type LoadingState =
    | "loading"
    | "ready"
    | "error";

// Requests the lightweight summaries exposed by the collection API.
async function fetchWordLists(
    signal: AbortSignal,
): Promise<readonly WordListSummary[]> {
    const response = await fetch(
        "/api/word-lists",
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
            signal,
        },
    );

    if (!response.ok) {
        throw new Error(
            "The word-list API did not return a successful response.",
        );
    }

    const body =
        await response.json() as ApiSuccessBody<
            readonly WordListSummary[]
        >;

    return body.data;
}

function formatUpdatedDate(
    updatedAt: string,
): string {
    return new Intl.DateTimeFormat(
        "en-AU",
        {
            dateStyle: "medium",
        },
    ).format(new Date(updatedAt));
}

export function WordListLibrary() {
    const [
        wordLists,
        setWordLists,
    ] = useState<readonly WordListSummary[]>([]);

    const [
        loadingState,
        setLoadingState,
    ] = useState<LoadingState>("loading");

    // Changing this value repeats the loading effect.
    const [
        refreshRequest,
        setRefreshRequest,
    ] = useState(0);

    useEffect(() => {
        const controller =
            new AbortController();

        async function loadWordLists() {
            setLoadingState("loading");

            try {
                const loadedWordLists =
                    await fetchWordLists(
                        controller.signal,
                    );

                setWordLists(loadedWordLists);
                setLoadingState("ready");
            } catch {
                if (controller.signal.aborted) {
                    return;
                }

                setWordLists([]);
                setLoadingState("error");
            }
        }

        void loadWordLists();

        // Cancels the request if the page unmounts or refreshes.
        return () => {
            controller.abort();
        };
    }, [refreshRequest]);

    return (
        <section
            className="mt-12"
            aria-labelledby="word-library-heading"
            aria-busy={
                loadingState === "loading"
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2
                        id="word-library-heading"
                        className="text-2xl font-semibold"
                    >
                        Saved word lists
                    </h2>

                    <p className="mt-2 max-w-2xl text-(--muted-text)">
                        These lists are stored in PostgreSQL and can be reused across activities.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setRefreshRequest(
                            (currentRequest) =>
                                currentRequest + 1,
                        )
                    }
                    disabled={
                        loadingState === "loading"
                    }
                    className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-wait disabled:opacity-60"
                >
                    {loadingState === "loading"
                        ? "Loading…"
                        : "Refresh library"}
                </button>
            </div>

            <p
                className="sr-only"
                aria-live="polite"
            >
                {loadingState === "loading"
                    ? "Loading word lists."
                    : loadingState === "error"
                        ? "Word lists could not be loaded."
                        : `${wordLists.length} word lists loaded.`}
            </p>

            {loadingState === "loading" ? (
                <div
                    role="status"
                    className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) text-(--muted-text) shadow-sm"
                >
                    Loading saved word lists…
                </div>
            ) : null}

            {loadingState === "error" ? (
                <div
                    role="alert"
                    className="mt-6 rounded-2xl border border-(--control-border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                >
                    <h3 className="text-lg font-semibold">
                        The library is unavailable
                    </h3>

                    <p className="mt-2 text-(--muted-text)">
                        Check that PostgreSQL is running, then try refreshing the library.
                    </p>
                </div>
            ) : null}

            {loadingState === "ready" &&
            wordLists.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-(--control-border) bg-(--surface) p-(--panel-spacing) text-center">
                    <h3 className="text-lg font-semibold">
                        No word lists yet
                    </h3>

                    <p className="mt-2 text-(--muted-text)">
                        Your first teacher-created word list will appear here.
                    </p>
                </div>
            ) : null}

            {loadingState === "ready" &&
            wordLists.length > 0 ? (
                <div className="mt-6 grid gap-(--control-spacing) md:grid-cols-2">
                    {wordLists.map(
                        (wordList) => (
                            <article
                                key={wordList.id}
                                className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <h3 className="text-xl font-semibold">
                                        {wordList.name}
                                    </h3>

                                    <span className="rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-semibold text-(--accent)">
                                        {
                                            wordList.wordCount
                                        }{" "}
                                        {wordList.wordCount ===
                                        1
                                            ? "word"
                                            : "words"}
                                    </span>
                                </div>

                                <p className="mt-3 leading-7 text-(--muted-text)">
                                    {wordList.description ??
                                        "No description provided."}
                                </p>

                                <p className="mt-5 text-sm text-(--muted-text)">
                                    Last updated{" "}
                                    {formatUpdatedDate(
                                        wordList.updatedAt,
                                    )}
                                </p>
                            </article>
                        ),
                    )}
                </div>
            ) : null}
        </section>
    );
}