"use client";

import { useEffect, useState, } from "react";
import { WordForm, } from "@/features/library/word-form";
import type {
    WordListDetail,
    WordListSummary,
    WordRecord,
} from "@/features/library/types";

interface WordListWorkspaceProps {
    readonly wordList: WordListSummary;
    readonly onClose: () => void;
    readonly onWordCountChanged: (
        listId: string,
        wordCount: number,
    ) => void;
}

type WordFormSelection =
    | {
        readonly mode: "create";
    }
    | {
        readonly mode: "edit";
        readonly word: WordRecord;
    }
    | null;

interface ApiSuccessBody<T> {
    readonly data: T;
}

function upsertWord(
    words: readonly WordRecord[],
    savedWord: WordRecord,
): readonly WordRecord[] {
    return [
        ...words.filter(
            (word) => word.id !== savedWord.id,
        ),
        savedWord,
    ].sort((left, right) =>
        left.english.localeCompare(right.english),
    );
}

export function WordListWorkspace({
    wordList,
    onClose,
    onWordCountChanged,
}: WordListWorkspaceProps) {
    const [detail, setDetail] = useState<WordListDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formSelection, setFormSelection] = useState<WordFormSelection>(null);
    const [refreshNumber, setRefreshNumber] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );
    const [statusMessage, setStatusMessage] = useState<string | null>(
        null,
    );

    // This loads the selected list and its database-backed words.
    useEffect(() => {
        const controller = new AbortController();

        async function loadWordList() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const response = await fetch(
                    `/api/word-lists/${wordList.id}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "The selected word list could not be loaded.",
                    );
                }

                const body = await response.json() as
                    ApiSuccessBody<WordListDetail>;

                const loadedDetail = body.data;

                setDetail(loadedDetail);

                setFormSelection((current) => {
                    if (current?.mode !== "edit") {
                        return current;
                    }

                    const refreshedWord =
                        loadedDetail.words.find(
                            (word) =>
                                word.id === current.word.id,
                        );

                    return refreshedWord
                        ? {
                            mode: "edit",
                            word: refreshedWord,
                        }
                        : null;
                });
            } catch (error) {
                if (
                    error instanceof DOMException
                    && error.name === "AbortError"
                ) {
                    return;
                }

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "The selected word list could not be loaded.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadWordList();

        return () => controller.abort();
    }, [
        refreshNumber,
        wordList.id,
    ]);

    function handleWordSaved(
        savedWord: WordRecord,
    ) {
        if (!detail) {
            return;
        }

        const existed = detail.words.some(
            (word) => word.id === savedWord.id,
        );

        const visibleWords = upsertWord(
            detail.words,
            savedWord,
        );

        setDetail((current) => {
            if (!current) {
                return current;
            }

            const words = upsertWord(
                current.words,
                savedWord,
            );

            return {
                ...current,
                words,
                wordCount: words.length,
            };
        });

        onWordCountChanged(
            wordList.id,
            visibleWords.length,
        );

        setFormSelection(null);
        setErrorMessage(null);
        setStatusMessage(
            `${savedWord.english} was ${existed ? "updated" : "added"
            }.`,
        );
    }

    return (
        <section
            id="word-list-workspace"
            aria-labelledby="word-workspace-heading"
            className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-5"
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-(--accent)">
                        Selected word list
                    </p>

                    <h2
                        className="mt-1 text-2xl font-bold"
                        id="word-workspace-heading"
                    >
                        {wordList.name}
                    </h2>
                </div>

                <button
                    className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-5 py-2 font-semibold text-foreground transition-colors hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    onClick={onClose}
                    type="button"
                >
                    Close word manager
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    aria-controls="word-form"
                    aria-expanded={
                        formSelection?.mode === "create"
                    }
                    className="rounded-lg bg-(--action) px-5 py-2 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    onClick={() => {
                        setFormSelection({
                            mode: "create",
                        });
                        setErrorMessage(null);
                        setStatusMessage(null);
                    }}
                    type="button"
                >
                    Add word
                </button>

                <button
                    className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-5 py-2 font-semibold text-foreground transition-colors hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    onClick={() => setRefreshNumber((
                        current,
                    ) => current + 1)}
                    type="button"
                >
                    Refresh words
                </button>
            </div>

            {formSelection ? (
                <WordForm
                    key={
                        formSelection.mode === "edit"
                            ? formSelection.word.id
                            : "new-word"
                    }
                    onCancel={() =>
                        setFormSelection(null)
                    }
                    onSaved={handleWordSaved}
                    word={
                        formSelection.mode === "edit"
                            ? formSelection.word
                            : null
                    }
                    wordListId={wordList.id}
                />
            ) : null}

            {statusMessage ? (
                <p
                    className="text-sm text-(--success)"
                    role="status"
                >
                    {statusMessage}
                </p>
            ) : null}

            {isLoading ? (
                <p role="status">Loading words...</p>
            ) : null}

            {errorMessage ? (
                <p
                    className="text-sm text-(--danger)"
                    role="alert"
                >
                    {errorMessage}
                </p>
            ) : null}

            {!isLoading && detail ? (
                detail.words.length === 0 ? (
                    <p className="text-(--muted-text)">
                        This list does not contain any words yet.
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {detail.words.map((word) => (
                            <article
                                className="rounded-xl border border-(--border) bg-background p-4"
                                key={word.id}
                            >
                                <div className="flex flex-wrap items-baseline gap-3">
                                    <h3 className="text-lg font-semibold">
                                        {word.english}
                                    </h3>

                                    <span className="text-(--muted-text)">
                                        {word.ipa}
                                    </span>
                                </div>

                                <p className="sr-only">
                                    Ordered phonemes:{" "}
                                    {word.phonemes
                                        .map((phoneme) => phoneme.ipaSymbol)
                                        .join(", ")}
                                </p>

                                <div
                                    aria-hidden="true"
                                    className="mt-3 flex flex-wrap items-center gap-2"
                                >
                                    {word.phonemes.map((
                                        phoneme,
                                        index,
                                    ) => (
                                        <div
                                            className="flex items-center gap-2"
                                            key={phoneme.id}
                                        >
                                            {index > 0 ? (
                                                <span>→</span>
                                            ) : null}

                                            <span
                                                className="rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-semibold"
                                                title={`${phoneme.grapheme} as in ${phoneme.exampleWord}`}
                                            >
                                                {phoneme.ipaSymbol}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        aria-controls="word-form"
                                        aria-expanded={
                                            formSelection?.mode === "edit" &&
                                            formSelection.word.id === word.id
                                        }
                                        className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground transition-colors hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                        onClick={() => {
                                            setFormSelection({
                                                mode: "edit",
                                                word,
                                            });
                                            setErrorMessage(null);
                                            setStatusMessage(null);
                                        }}
                                        type="button"
                                    >
                                        Edit
                                        <span className="sr-only">
                                            {" "}{word.english}
                                        </span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )
            ) : null}
        </section>
    );
}