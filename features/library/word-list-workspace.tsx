"use client";

import {useEffect,useState,} from "react";
import {WordForm,} from "@/features/library/word-form";
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

interface ApiSuccessBody<T> {
    readonly data: T;
}

export function WordListWorkspace({
    wordList,
    onClose,
    onWordCountChanged,
}: WordListWorkspaceProps) {
    const [detail, setDetail] = useState<WordListDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingWord, setIsAddingWord] = useState(false);
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

                setDetail(body.data);
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

    // This adds the new API record to the visible list immediately.
    function handleWordCreated(word: WordRecord) {
        if (!detail) {
            return;
        }

        const words = [
            ...detail.words,
            word,
        ].sort((left, right) => (
            left.english.localeCompare(right.english)
        ));

        setDetail({
            ...detail,
            words,
            wordCount: words.length,
        });
        onWordCountChanged(wordList.id, words.length);
        setIsAddingWord(false);
        setStatusMessage(`${word.english} was added.`);
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
                    className="secondary-button"
                    onClick={onClose}
                    type="button"
                >
                    Close word manager
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    className="primary-button"
                    onClick={() => {
                        setIsAddingWord(true);
                        setStatusMessage(null);
                    }}
                    type="button"
                >
                    Add word
                </button>

                <button
                    className="secondary-button"
                    onClick={() => setRefreshNumber((
                        current,
                    ) => current + 1)}
                    type="button"
                >
                    Refresh words
                </button>
            </div>

            {isAddingWord ? (
                <WordForm
                    onCancel={() => setIsAddingWord(false)}
                    onCreated={handleWordCreated}
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
                    <p className="text-(--muted-foreground)">
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

                                    <span className="text-(--muted-foreground)">
                                        /{word.ipa}/
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
                            </article>
                        ))}
                    </div>
                )
            ) : null}
        </section>
    );
}