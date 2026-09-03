"use client";

import { useState, type SubmitEventHandler, } from "react";

import { PhonemeTokenEditor, } from "@/features/library/phoneme-token-editor";
import type { PhonemeTokenDraft, WordRecord, } from "@/features/library/types";

interface WordFormProps {
    readonly wordListId: string;
    readonly onCreated: (word: WordRecord) => void;
    readonly onCancel: () => void;
}

interface ApiSuccessBody<T> {
    readonly data: T;
}

interface ApiErrorBody {
    readonly error?: {
        readonly message?: string;
    };
}

const INITIAL_PHONEME: PhonemeTokenDraft = {
    key: "phoneme-token-1",
    ipaSymbol: "",
    grapheme: "",
    exampleWord: "",
    spokenName: "",
};

export function WordForm({
    wordListId,
    onCreated,
    onCancel,
}: WordFormProps) {
    const [english, setEnglish] = useState("");
    const [ipa, setIpa] = useState("");
    const [phonemes, setPhonemes] = useState<
        readonly PhonemeTokenDraft[]
    >([INITIAL_PHONEME]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    // This sends the word and its ordered phonemes to the content API.
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (
        event,
    ) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `/api/word-lists/${wordListId}/words`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        english,
                        ipa,
                        phonemes: phonemes.map((phoneme) => ({
                            ipaSymbol: phoneme.ipaSymbol,
                            grapheme: phoneme.grapheme,
                            exampleWord: phoneme.exampleWord,
                            spokenName: phoneme.spokenName,
                        })),
                    }),
                },
            );

            const body = await response.json() as
                | ApiSuccessBody<WordRecord>
                | ApiErrorBody;

            if (
                !response.ok
                || !("data" in body)
            ) {
                throw new Error(
                    "error" in body
                        ? body.error?.message
                        ?? "The word could not be saved."
                        : "The word could not be saved.",
                );
            }

            onCreated(body.data);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "The word could not be saved.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            aria-labelledby="word-form-heading"
            className="rounded-2xl border border-(--border) bg-(--surface) p-5"
        >
            <h3
                className="text-xl font-semibold"
                id="word-form-heading"
            >
                Add a word
            </h3>

            <p className="mt-2 text-sm text-(--muted-text)">
                Enter the complete word and IPA transcription, then
                describe each sound as a separate ordered phoneme token.
            </p>

            <form
                className="mt-5 space-y-5"
                onSubmit={handleSubmit}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <label
                        className="grid gap-2 text-sm font-medium"
                        htmlFor="new-word-english"
                    >
                        English word

                        <input
                            className="w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSubmitting}
                            id="new-word-english"
                            maxLength={100}
                            onChange={(event) => setEnglish(
                                event.target.value,
                            )}
                            placeholder="chin"
                            required
                            value={english}
                        />
                    </label>

                    <label
                        className="grid gap-2 text-sm font-medium"
                        htmlFor="new-word-ipa"
                    >
                        Complete IPA transcription

                        <input
                            aria-describedby="new-word-ipa-help"
                            className="w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSubmitting}
                            id="new-word-ipa"
                            maxLength={200}
                            onChange={(event) => setIpa(
                                event.target.value,
                            )}
                            placeholder="tʃɪn"
                            required
                            value={ipa}
                        />
                        <span
                            className="text-xs font-normal text-(--muted-text)"
                            id="new-word-ipa-help"
                        >
                            Enter the complete transcription with or without
                            slashes. Orate stores exactly one surrounding pair.
                        </span>
                    </label>
                </div>

                <PhonemeTokenEditor
                    disabled={isSubmitting}
                    onChange={setPhonemes}
                    tokens={phonemes}
                />

                {errorMessage ? (
                    <p
                        className="text-sm text-(--danger)"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                    <button
                        className="rounded-lg bg-(--action) px-5 py-2 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-wait disabled:opacity-60"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting
                            ? "Saving word..."
                            : "Save word"}
                    </button>

                    <button
                        className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-5 py-2 font-semibold text-foreground transition-colors hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting}
                        onClick={onCancel}
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}