"use client";

import {useState, type SubmitEventHandler,} from "react";
import type {ApiErrorBody,ApiSuccessBody,} from "@/lib/api/responses";
import type {WordListSummary,} from "@/features/library/types";

interface WordListFormProps {
    readonly wordList: WordListSummary | null;
    readonly onSaved: (
        wordList: WordListSummary,
    ) => void;
    readonly onCancel: () => void;
}

export function WordListForm({
    wordList,
    onSaved,
    onCancel,
}: WordListFormProps) {
    const isEditing = wordList !== null;

    const [
        name,
        setName,
    ] = useState(wordList?.name ?? "");

    const [
        description,
        setDescription,
    ] = useState(
        wordList?.description ?? "",
    );

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");
    
    const handleSubmit: SubmitEventHandler<
        HTMLFormElement
    > = async (submitEvent) => {
        submitEvent.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch(
                isEditing
                    ? `/api/word-lists/${wordList.id}`
                    : "/api/word-lists",
                {
                    method:
                        isEditing
                            ? "PATCH"
                            : "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        // Empty descriptions are stored consistently as null.
                        description:
                            description.trim() ||
                            null,
                    }),
                },
            );

            const responseBody =
                await response.json() as
                    | ApiSuccessBody<WordListSummary>
                    | ApiErrorBody;

            if (!response.ok) {
                const { error } =
                    responseBody as ApiErrorBody;

                setErrorMessage(
                    error.details?.[0]?.message ??
                        error.message,
                );
                setIsSubmitting(false);
                return;
            }

            const { data } =
                responseBody as ApiSuccessBody<
                    WordListSummary
                >;

            setIsSubmitting(false);
            onSaved(data);
        } catch {
            setErrorMessage(
                "Unable to reach the Orate API. Check the server and try again.",
            );
            setIsSubmitting(false);
        }
    };

    return (
        <section
            id="word-list-form"
            aria-labelledby="word-list-form-heading"
            className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
        >
            <p className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                {isEditing
                    ? "Edit content group"
                    : "New content group"}
            </p>

            <h3
                id="word-list-form-heading"
                className="mt-1 text-2xl font-semibold"
            >
                {isEditing
                    ? `Edit ${wordList.name}`
                    : "Create a word list"}
            </h3>

            <p className="mt-2 max-w-2xl text-(--muted-text)">
                Word lists group the teacher-entered words that will later be available to Orate activities.
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-(--control-spacing)"
            >
                <div>
                    <label
                        htmlFor="word-list-name"
                        className="block font-semibold"
                    >
                        List name
                    </label>

                    <p
                        id="word-list-name-help"
                        className="mt-1 text-sm text-(--muted-text)"
                    >
                        Use a clear classroom or topic name.
                    </p>

                    <input
                        id="word-list-name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(changeEvent) =>
                            setName(
                                changeEvent.target.value,
                            )
                        }
                        required
                        maxLength={100}
                        autoFocus
                        disabled={isSubmitting}
                        aria-describedby="word-list-name-help"
                        className="mt-2 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:opacity-60"
                    />
                </div>

                <div>
                    <label
                        htmlFor="word-list-description"
                        className="block font-semibold"
                    >
                        Description
                        <span className="ml-2 text-sm font-normal text-(--muted-text)">
                            Optional
                        </span>
                    </label>

                    <p
                        id="word-list-description-help"
                        className="mt-1 text-sm text-(--muted-text)"
                    >
                        Explain the learner group, topic, or intended activity.
                    </p>

                    <textarea
                        id="word-list-description"
                        name="description"
                        value={description}
                        onChange={(changeEvent) =>
                            setDescription(
                                changeEvent.target.value,
                            )
                        }
                        rows={4}
                        maxLength={500}
                        disabled={isSubmitting}
                        aria-describedby="word-list-description-help word-list-description-count"
                        className="mt-2 w-full resize-y rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:opacity-60"
                    />

                    <p
                        id="word-list-description-count"
                        className="mt-1 text-right text-sm text-(--muted-text)"
                    >
                        {description.length}/500
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-(--action) px-5 py-2 font-semibold text-(--action-text) hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-wait disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Saving…"
                            : isEditing
                                ? "Save changes"
                                : "Create word list"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-lg border border-(--control-border) bg-(--surface-muted) px-5 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>

                <p
                    role={errorMessage ? "alert" : undefined}
                    aria-live="polite"
                    className="min-h-6 text-sm text-(--muted-text)"
                >
                    {errorMessage}
                </p>
            </form>
        </section>
    );
}