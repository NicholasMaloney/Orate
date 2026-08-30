"use client";

import {useEffect,useState,} from "react";
import {WordListWorkspace,} from "@/features/library/word-list-workspace";
import {WordListForm,} from "@/features/library/word-list-form";
import type {WordListSummary,} from "@/features/library/types";
import type {ApiSuccessBody,} from "@/lib/api/responses";

type LoadingState =
    | "loading"
    | "ready"
    | "error";

type WordListFormSelection =
    | {
        readonly mode: "create";
    }
    | {
        readonly mode: "edit";
        readonly wordList: WordListSummary;
    }
    | null;

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

// Keeps newly created or renamed lists in alphabetical order.
function sortWordLists(
    wordLists: readonly WordListSummary[],
): readonly WordListSummary[] {
    return [...wordLists].sort(
        (first, second) =>
            first.name.localeCompare(
                second.name,
            ),
    );
}

export function WordListLibrary() {
    const [
        wordLists,
        setWordLists,
    ] = useState<readonly WordListSummary[]>([]);

    const [managedWordList, setManagedWordList] =
        useState<WordListSummary | null>(null);
    const [
        loadingState,
        setLoadingState,
    ] = useState<LoadingState>("loading");

    const [
        refreshRequest,
        setRefreshRequest,
    ] = useState(0);

    const [
        formSelection,
        setFormSelection,
    ] = useState<WordListFormSelection>(null);

    const [
        actionStatus,
        setActionStatus,
    ] = useState("");

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

        return () => {
            controller.abort();
        };
    }, [refreshRequest]);

    function handleWordListSaved(
        savedWordList: WordListSummary,
    ) {
        const wasEditing =
            formSelection?.mode === "edit";

        setWordLists((currentWordLists) =>
            sortWordLists([
                ...currentWordLists.filter(
                    (wordList) =>
                        wordList.id !==
                        savedWordList.id,
                ),
                savedWordList,
            ]),
        );

        setFormSelection(null);

        setActionStatus(
            `${savedWordList.name} was ${wasEditing
                ? "updated"
                : "created"
            }.`,
        );
    }


    function openCreateForm() {
        setManagedWordList(null);
        setActionStatus("");
        setFormSelection({
            mode: "create",
        });
    }

    function openEditForm(
        wordList: WordListSummary,
    ) {
        setManagedWordList(null);
        setActionStatus("");
        setFormSelection({
            mode: "edit",
            wordList,
        });
    }
    // This opens the word-management workspace for the selected list.
    function openWordManager(
        wordList: WordListSummary,
    ) {
        setFormSelection(null);
        setManagedWordList(wordList);
        setActionStatus("");
    }

    // This keeps the summary card count in sync after adding a word.
    function handleWordCountChanged(
        listId: string,
        wordCount: number,
    ) {
        setWordLists((currentLists) =>
            currentLists.map((wordList) => (
                wordList.id === listId
                    ? {
                        ...wordList,
                        wordCount,
                    }
                    : wordList
            )),
        );

        setManagedWordList((currentList) => (
            currentList?.id === listId
                ? {
                    ...currentList,
                    wordCount,
                }
                : currentList
        ));
    }
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

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={openCreateForm}
                        aria-controls="word-list-form"
                        aria-expanded={
                            formSelection?.mode ===
                            "create"
                        }
                        className="rounded-lg bg-(--action) px-4 py-2 font-semibold text-(--action-text) hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    >
                        New word list
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActionStatus("");
                            setRefreshRequest(
                                (currentRequest) =>
                                    currentRequest + 1,
                            );
                        }}
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
            </div>

            {formSelection ? (
                <WordListForm
                    key={
                        formSelection.mode === "edit"
                            ? formSelection.wordList.id
                            : "new-word-list"
                    }
                    wordList={
                        formSelection.mode === "edit"
                            ? formSelection.wordList
                            : null
                    }
                    onSaved={handleWordListSaved}
                    onCancel={() =>
                        setFormSelection(null)
                    }
                />
            ) : null}

            {managedWordList ? (
                <div className="mt-6">
                    <WordListWorkspace
                        key={managedWordList.id}
                        wordList={managedWordList}
                        onClose={() =>
                            setManagedWordList(null)
                        }
                        onWordCountChanged={
                            handleWordCountChanged
                        }
                    />
                </div>
            ) : null}

            <p
                aria-live="polite"
                className="mt-4 min-h-6 text-sm text-(--muted-text)"
            >
                {actionStatus}
            </p>

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
                    className="mt-2 rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) text-(--muted-text) shadow-sm"
                >
                    Loading saved word lists…
                </div>
            ) : null}

            {loadingState === "error" ? (
                <div
                    role="alert"
                    className="mt-2 rounded-2xl border border-(--control-border) bg-(--surface) p-(--panel-spacing) shadow-sm"
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
                <div className="mt-2 rounded-2xl border border-dashed border-(--control-border) bg-(--surface) p-(--panel-spacing) text-center">
                    <h3 className="text-lg font-semibold">
                        No word lists yet
                    </h3>

                    <p className="mt-2 text-(--muted-text)">
                        Select New word list to create your first classroom collection.
                    </p>
                </div>
            ) : null}

            {loadingState === "ready" &&
                wordLists.length > 0 ? (
                <div className="mt-2 grid gap-(--control-spacing) md:grid-cols-2">
                    {wordLists.map(
                        (wordList) => (
                            <article
                                key={wordList.id}
                                className="flex flex-col rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
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

                                <p className="mt-3 flex-1 leading-7 text-(--muted-text)">
                                    {wordList.description ??
                                        "No description provided."}
                                </p>

                                <p className="mt-5 text-sm text-(--muted-text)">
                                    Last updated{" "}
                                    {formatUpdatedDate(
                                        wordList.updatedAt,
                                    )}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openWordManager(wordList)
                                        }
                                        aria-controls="word-list-workspace"
                                        aria-expanded={
                                            managedWordList?.id === wordList.id
                                        }
                                        className="w-fit rounded-lg bg-(--action) px-4 py-2 font-semibold text-(--action-text) hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                    >
                                        Manage words
                                        <span className="sr-only">
                                            {" "}
                                            in {wordList.name}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditForm(wordList)
                                        }
                                        aria-controls="word-list-form"
                                        aria-expanded={
                                            formSelection?.mode === "edit"
                                            && formSelection.wordList.id
                                            === wordList.id
                                        }
                                        className="w-fit rounded-md font-semibold text-(--accent) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
                                    >
                                        Edit list
                                        <span className="sr-only">
                                            {" "}
                                            {wordList.name}
                                        </span>
                                    </button>
                                </div>
                            </article>
                        ),
                    )}
                </div>
            ) : null}
        </section>
    );
}