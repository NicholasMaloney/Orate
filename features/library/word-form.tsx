"use client";

import {useState,type SubmitEventHandler,} from "react";

import {PhonemeTokenEditor,} from "@/features/library/phoneme-token-editor";
import type {PhonemeTokenDraft,WordRecord,} from "@/features/library/types";

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

            <p className="mt-2 text-sm text-(--muted-foreground)">
                Enter the complete word, then describe each sound as
                a separate ordered phoneme token.
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
                            className="text-input"
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
                            className="text-input"
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
                        className="primary-button"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting
                            ? "Saving word..."
                            : "Save word"}
                    </button>

                    <button
                        className="secondary-button"
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