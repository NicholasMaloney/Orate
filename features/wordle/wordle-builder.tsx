"use client";

import { useState, useMemo } from "react";
import { ActivityPreview } from "@/components/activity-preview";
import { usePreferences } from "@/components/preference-provider";
import { SavedConfigurationPanel } from "@/features/activities/saved-configuration-panel";
import { useActivityContent } from "@/features/activities/use-activity-content";
import { useSavedConfigurations } from "@/features/activities/use-saved-configurations";
import { downloadHtmlFile } from "@/lib/download";
import { buildStandaloneWordleHtml } from "@/lib/standalone";
import type { Difficulty, Phoneme, WordleConfigurationRecord } from "@/lib/types";
import {
    DIFFICULTY_DETAILS,
    DIFFICULTY_ORDER,
} from "@/lib/difficulty";



export function WordleBuilder() {
    const { resolvedTheme } = usePreferences();

    const {
        wordLists,
        selectedListId,
        content,
        listsState,
        contentState,
        errorMessage,
        selectList,
        prepareContent,
        commitPreparedContent,
        reloadLists,
        reloadContent,
    } = useActivityContent();

    // Content is usable only when it belongs to the current selection.
    // During a word list change, reach can render the new 'selectedListId' while the prev list still exisits
    // activeContent prevents the newly selected list from accedently dislaying words from the prev list
    const activeContent =
        content?.id === selectedListId
            ? content
            : null;

    const [wordId, setWordId] =
        useState("");

    const [
        difficulty,
        setDifficulty,
    ] = useState<Difficulty>(
        "standard",
    );

    const [
        hintsEnabled,
        setHintsEnabled,
    ] = useState(true);

    const [
        downloadStatus,
        setDownloadStatus,
    ] = useState("");

    // Validates saved content before changing the current builder.
    // WordleConfigurationRecord contains the target’s wordListId, allows Orate to move to the correct list before selecting the saved word.
    async function loadWordleConfiguration(
        record: WordleConfigurationRecord,
    ): Promise<void> {
        const prepared =
            await prepareContent(
                record.word.wordListId,
            );

        const targetExists =
            prepared.words.some(
                (word) =>
                    word.id === record.wordId,
            );

        if (!targetExists) {
            throw new Error(
                "The saved target is no longer available in its word list.",
            );
        }

        // Apply the prepared list and all stored controls together.
        commitPreparedContent(prepared);
        setWordId(record.wordId);
        setDifficulty(record.difficulty);
        setHintsEnabled(record.hintsEnabled);
        setDownloadStatus("");
    }

    const savedConfigurations =
        useSavedConfigurations<
            WordleConfigurationRecord
        >({
            endpoint:
                "/api/wordle-configurations",
            label: "Wordle",
            onLoad:
                loadWordleConfiguration,
        });

    // Uses the requested target when valid, otherwise the first word.
    const selectedWord =
        activeContent?.words.find(
            (word) =>
                word.id === wordId,
        ) ??
        activeContent?.words[0] ??
        null;

    const phonemeById = useMemo(
        () =>
            new Map<string, Phoneme>(
                activeContent?.phonemes.map(
                    (phoneme) => [
                        phoneme.id,
                        phoneme,
                    ],
                ) ?? [],
            ),
        [activeContent],
    );

    const selectedPhonemes =
        selectedWord?.phonemeIds
            .map((phonemeId) =>
                phonemeById.get(
                    phonemeId,
                ),
            )
            .filter(
                (
                    phoneme,
                ): phoneme is Phoneme =>
                    phoneme !== undefined,
            ) ?? [];

    const hasCompleteSequence =
        selectedWord !== null &&
        selectedPhonemes.length ===
        selectedWord.phonemeIds.length;

    // The keyboard must not reveal the answer by showing only its sounds.
    const hasDistractor =
        selectedWord !== null &&
        activeContent !== null &&
        activeContent.phonemes.some(
            (phoneme) =>
                !selectedWord.phonemeIds.includes(
                    phoneme.id,
                ),
        );

    const canGenerate =
        selectedWord !== null &&
        hasCompleteSequence &&
        hasDistractor;

    // Saves the current valid builder controls.
    async function handleCreateConfiguration(): Promise<void> {
        if (
            !canGenerate ||
            !selectedWord
        ) {
            return;
        }

        await savedConfigurations.create({
            wordId: selectedWord.id,
            difficulty,
            hintsEnabled,
        });
    }

    // Replaces the selected saved configuration.
    async function handleUpdateConfiguration(): Promise<void> {
        if (
            !canGenerate ||
            !selectedWord
        ) {
            return;
        }

        await savedConfigurations.update({
            wordId: selectedWord.id,
            difficulty,
            hintsEnabled,
        });
    }

    // Generate directly from the current render's validated content.
    let standaloneHtml = "";
    let generationError = "";

    if (
        canGenerate &&
        activeContent &&
        selectedWord
    ) {
        try {
            standaloneHtml =
                buildStandaloneWordleHtml(
                    {
                        wordId:
                            selectedWord.id,
                        difficulty,
                        hintsEnabled,
                    },
                    {
                        selectedWord,
                        phonemes:
                            activeContent.phonemes,
                    },
                    resolvedTheme,
                );
        } catch (error) {
            generationError =
                error instanceof Error
                    ? error.message
                    : "The Wordle could not be generated.";
        }
    }

    function handleDownload() {
        if (
            !standaloneHtml ||
            !selectedWord
        ) {
            return;
        }

        const filename =
            `orate-wordle-${selectedWord.id}.html`;

        downloadHtmlFile(
            filename,
            standaloneHtml,
        );

        setDownloadStatus(
            `Downloaded ${filename}. Open it in a browser to test the learner activity.`,
        );
    }

    return (
        <>
            <div className="mt-12 grid gap-(--panel-spacing) lg:grid-cols-[22rem_minmax(0,1fr)]">
                <section
                    className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) text-foreground shadow-sm"
                    aria-labelledby="wordle-controls-heading"
                >
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                        Teacher Controls
                    </h3>

                    <h2 id="wordle-controls-heading" className="mt-1 text-2xl font-semibold">
                        Configure the Wordle Activity
                    </h2>

                    <div className="mt-6">
                        <label
                            htmlFor="word-list"
                            className="block font-semibold text-foreground"
                        >
                            Word list
                        </label>

                        <p
                            id="word-list-help"
                            className="mt-1 text-sm text-(--muted-text)"
                        >
                            Choose a Word list from the options below. To create a custom Word list navigate to the Library
                        </p>

                        <select
                            id="word-list"
                            name="wordList"
                            value={selectedListId}
                            disabled={
                                listsState !==
                                "ready" ||
                                wordLists.length === 0
                            }
                            onChange={(event) => {
                                setWordId("");
                                setDownloadStatus("");
                                selectList(
                                    event.target.value,
                                );
                            }}
                            aria-describedby="word-list-help"
                            className="mt-3 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {wordLists.length === 0 ? (
                                <option value="">
                                    No word lists available
                                </option>
                            ) : (
                                wordLists.map(
                                    (wordList) => (
                                        <option
                                            key={
                                                wordList.id
                                            }
                                            value={
                                                wordList.id
                                            }
                                        >
                                            {wordList.name}
                                            {" — "}
                                            {
                                                wordList.wordCount
                                            }
                                            {" words"}
                                        </option>
                                    ),
                                )
                            )}
                        </select>
                    </div>

                    <div
                        className="mt-4 space-y-3"
                        aria-live="polite"
                    >
                        {listsState ===
                            "loading" ? (
                            <p className="text-sm text-(--muted-text)">
                                Loading word lists…
                            </p>
                        ) : null}

                        {listsState ===
                            "error" ? (
                            <div>
                                <p
                                    role="alert"
                                    className="text-sm text-(--danger)"
                                >
                                    {errorMessage}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        reloadLists
                                    }
                                    className="mt-3 rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                >
                                    Retry word lists
                                </button>
                            </div>
                        ) : null}

                        {listsState ===
                            "ready" &&
                            wordLists.length === 0 ? (
                            <p className="text-sm text-(--muted-text)">
                                Create a word list in the
                                Library before building a
                                Wordle.
                            </p>
                        ) : null}

                        {contentState ===
                            "loading" ? (
                            <p className="text-sm text-(--muted-text)">
                                Loading activity content…
                            </p>
                        ) : null}

                        {contentState ===
                            "error" ? (
                            <div>
                                <p
                                    role="alert"
                                    className="text-sm text-(--danger)"
                                >
                                    {errorMessage}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        reloadContent
                                    }
                                    className="mt-3 rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                >
                                    Retry list content
                                </button>
                            </div>
                        ) : null}

                        {activeContent &&
                            activeContent.words.length ===
                            0 ? (
                            <p className="text-sm text-(--muted-text)">
                                This list is empty. Add words
                                in the Library before using it.
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-6">
                        <label
                            htmlFor="target-word"
                            className="block font-semibold text-foreground"
                        >
                            Target phoneme word
                        </label>

                        <p
                            id="target-word-help"
                            className="mt-1 text-sm text-(--muted-text)"
                        >
                            Select the word the student will
                            attempt to identify.
                        </p>

                        <select
                            id="target-word"
                            name="targetWord"
                            value={selectedWord?.id ?? ""} // On first load wordId is empty, but selectWord falls back to the first database word 
                            disabled={
                                !activeContent ||
                                activeContent.words
                                    .length === 0
                            }
                            onChange={(event) => {
                                setWordId(
                                    event.target.value,
                                );
                                setDownloadStatus("");
                            }}
                            aria-describedby="target-word-help"
                            className="mt-3 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {activeContent?.words
                                .length ? (
                                activeContent.words.map(
                                    (word) => (
                                        <option
                                            key={word.id}
                                            value={word.id}
                                        >
                                            {word.ipa}
                                            {" — "}
                                            {word.english}
                                        </option>
                                    ),
                                )
                            ) : (
                                <option value="">
                                    No words available
                                </option>
                            )}
                        </select>
                    </div>

                    {selectedWord ? (
                        <div className="mt-6 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-text)">
                                Selected activity
                            </p>

                            <div className="mt-2 flex items-baseline gap-3">
                                <strong className="text-2xl text-(--accent)">
                                    {selectedWord.ipa}
                                </strong>

                                <span className="text-(--muted-text)">
                                    {
                                        selectedWord.english
                                    }
                                </span>
                            </div>

                            <div
                                className="mt-4 flex flex-wrap gap-2"
                                aria-label={`Phoneme sequence for ${selectedWord.english}`}
                            >
                                {selectedPhonemes.map(
                                    (
                                        phoneme,
                                        position,
                                    ) => (
                                        <span
                                            key={`${phoneme.id}-${position}`}
                                            title={
                                                hintsEnabled
                                                    ? `${phoneme.grapheme} as in ${phoneme.exampleWord}`
                                                    : undefined
                                            }
                                            className="flex min-w-14 flex-col items-center rounded-lg border border-(--border) bg-(--surface) px-3 py-2"
                                        >
                                            <strong className="text-foreground">
                                                /
                                                {
                                                    phoneme.ipaSymbol
                                                }
                                                /
                                            </strong>

                                            {hintsEnabled ? (
                                                <span className="text-xs text-(--muted-text)">
                                                    {
                                                        phoneme.grapheme
                                                    }
                                                </span>
                                            ) : null}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    ) : null}

                    {selectedWord &&
                        !hasCompleteSequence ? (
                        <p
                            role="alert"
                            className="mt-4 text-sm text-(--danger)"
                        >
                            The target references a phoneme
                            that is unavailable in this list.
                        </p>
                    ) : null}

                    {/*
                        Show this warning only when:
                        1. a target word exists;
                        2. all its phonemes were resolved; and
                        3. the list contains no additional distractor sound.
                    */}
                    {selectedWord &&
                        hasCompleteSequence &&
                        !hasDistractor ? (
                        <p
                            role="alert"
                            className="mt-4 text-sm text-(--danger)"
                        >
                            Wordle requires at least one
                            additional phoneme that is not in
                            the target word. Add another word with
                            a different sound to this list.
                        </p>
                    ) : null}

                    {generationError ? (
                        <p
                            role="alert"
                            className="mt-4 text-sm text-(--danger)"
                        >
                            {generationError}
                        </p>
                    ) : null}

                    {/* Contains the difficulty controls displayed to the teacher. */}
                    <fieldset
                        className="mt-8"
                        aria-describedby="difficulty-help"
                    >
                        <legend className="font-semibold text-foreground">
                            Difficulty
                        </legend>

                        <p id="difficulty-help" className="mt-1 text-sm text-(--muted-text)">
                            Difficulty Controls how many attempts the student receives.
                        </p>

                        <div className="mt-4 space-y-(--control-spacing)">
                            {DIFFICULTY_ORDER.map((option) => {
                                const details = DIFFICULTY_DETAILS[option];

                                return (
                                    <label
                                        key={option}
                                        className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-(--control-border) bg-(--surface) p-4 transition-colors hover:border-(--accent) hover:bg-(--accent-soft)"
                                    >
                                        <input
                                            type="radio"
                                            name="wordle-difficulty"
                                            value={option}
                                            checked={difficulty === option}
                                            onChange={() => {
                                                setDifficulty(option);
                                                setDownloadStatus("");
                                            }}
                                            className="mt-1 h-4 w-4 shrink-0 accent-(--action) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                        />
                                        <span>
                                            <strong className="block text-foreground">
                                                {details.label}
                                            </strong>

                                            <span className="mt-1 block text-sm text-(--muted-text)">
                                                {details.attempts} attempts - {details.description}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/** Adds the option to enable phoneme hints and show english grapheme associated with each IPA sound.  */}
                    <label className="mt-8 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-(--control-border) bg-(--surface) p-4 transition-colors hover:border-(--accent) hover:bg-(--accent-soft)">
                        <span>
                            <strong className="block text-foreground">
                                Show phoneme hints
                            </strong>

                            <span className="mt-1 block text-sm text-(--muted-text)">
                                Show the English grapheme associated with each IPA sound.
                            </span>
                        </span>

                        <input
                            type="checkbox"
                            name="wordleHints"
                            checked={hintsEnabled}
                            onChange={(event) => {
                                setHintsEnabled(event.target.checked);
                                setDownloadStatus("");
                            }}
                            className="mt-1 h-5 w-5 shrink-0 accent-(--action) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                        />
                    </label>

                    <SavedConfigurationPanel
                        idPrefix="wordle"
                        activityLabel="Wordle"
                        records={
                            savedConfigurations.records
                        }
                        selectedId={
                            savedConfigurations.selectedId
                        }
                        name={savedConfigurations.name}
                        busy={savedConfigurations.busy}
                        canSave={canGenerate}
                        statusMessage={
                            savedConfigurations.statusMessage
                        }
                        errorMessage={
                            savedConfigurations.errorMessage
                        }
                        onSelect={
                            savedConfigurations.selectRecord
                        }
                        onNameChange={
                            savedConfigurations.setName
                        }
                        onCreate={
                            handleCreateConfiguration
                        }
                        onUpdate={
                            handleUpdateConfiguration
                        }
                        onDelete={
                            savedConfigurations.remove
                        }
                    />


                    {/** Download button */}
                    <div className="mt-8 border-t border-(--border) pt-6">
                        <h3 className="font-semibold text-foreground">
                            Download learner activity
                        </h3>

                        <p className="mt-1 text-sm text-(--muted-text)">
                            Generate one self contained HTML file using the current settings.
                        </p>

                        <button
                            type="button"
                            disabled={!standaloneHtml}
                            onClick={handleDownload}
                            className="mt-4 rounded-lg bg-(--action) px-5 py-3 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Download HTML
                        </button>

                        <p
                            className="mt-3 min-h-6 text-sm text-(--muted-text)"
                            aria-live="polite"
                        >
                            {downloadStatus}
                        </p>
                    </div>

                </section>

                {/*
                    The live activity Preview is only displayed if both the generated HTML and the targeted word for the Wordle activity
                    If this condition is not met, e.g. empty string, null or undefined value is given.
                    The activity preview will show a error message ' preview unavailable, please select.. etc"
                */}
                {standaloneHtml &&
                    selectedWord ? (
                    <ActivityPreview
                        html={standaloneHtml}
                        title={`Playable preview of ${selectedWord.ipa} Wordle`}
                        height={1000}
                    />
                ) : (
                    <section
                        className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                        aria-labelledby="wordle-preview-unavailable-heading"
                    >
                        <p className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                            Learner view
                        </p>

                        <h2
                            id="wordle-preview-unavailable-heading"
                            className="mt-1 text-2xl font-semibold text-foreground"
                        >
                            Preview unavailable
                        </h2>

                        <p className="mt-2 text-sm text-(--muted-text)">
                            Choose a populated list and a
                            valid target with at least one
                            distractor phoneme.
                        </p>
                    </section>
                )}
            </div>
        </>
    );
}