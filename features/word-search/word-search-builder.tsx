"use client";

import { useState } from "react";
import { usePreferences } from "@/components/preference-provider";
import { useActivityContent } from "@/features/activities/use-activity-content";
import { DIFFICULTY_DETAILS, DIFFICULTY_ORDER } from "@/lib/difficulty";
import { downloadHtmlFile } from "@/lib/download";
import { buildStandaloneWordSearchHtml } from "@/lib/standalone";
import type { Difficulty, WordSearchConfig } from "@/lib/types";
import { ActivityPreview } from "@/components/activity-preview";

// Describes how each Word Seach difficulty affects the puzzle 
// The generator contains the actual rules this just displays / explains the rules to the teacher and/or speach path
const WORD_SEARCH_DIFFICULTY_DESCRIPTIONS: Readonly<Record<Difficulty, string>
> = {
    easy: "8 × 8 grid using horizontal and vertical words.",
    standard: "10 × 10 grid that also includes diagonal words.",
    challenging: "12 × 12 grid with forward, reverse, and upward words.",
};

// This is max seed value since Prisma maps PostgreSQL Int columns to signed 32-bit values. 
const POSTGRES_INTEGER_MAXIMUM =
    2_147_483_647;

// Contains the teacher controls and preview for the Word Search activity 
export function WordSearchBuilder() {
    // This is used for light/dark mode theme application
    const { resolvedTheme } = usePreferences();

    // Loads word list data, requests states and actions from the shared database activity hook
    const {
        wordLists,
        selectedListId,
        content,        // Words and phonemes for a list
        listsState,     // loading state for lists, displayed on front end
        contentState,   // loading state for selected word list contnet
        errorMessage,   // api error message displayed on front end
        selectList,
        reloadLists,
        reloadContent,
    } = useActivityContent();

    // Prevent content from the previous selection appearing temporarily.
    const activeContent =
        content?.id === selectedListId
            ? content
            : null;

    // Difficulty choices
    const [difficulty, setDifficulty] =
        useState<Difficulty>("standard");

    // By default hints are enabled
    const [hintsEnabled, setHintsEnabled] = useState(true);

    // Word Search Generator Seed | Changing this number produces a different deterministic puzzle.
    const [seed, setSeed] = useState(260724);

    // Config combines the separate React state values into the object expected by generateWordSearch().
    const config: WordSearchConfig = {
        difficulty,
        seed,
        hintsEnabled,
    };

    // This is for the standalone HTML generator / downloader 
    const [downloadStatus, setDownloadStatus] = useState("");

    // Actiivty can only be generated when the list selected has finished loading and contains words and phoneme data
    const hasUsableContent =
        activeContent !== null &&
        activeContent.words.length > 0 &&
        activeContent.phonemes.length > 0;


    // Start with no gen activity or error message. Updates when component renders 
    let standaloneHtml = "";
    let generationError = "";

    // Only generates the HTML actiivty when the selected database list contains the words and phonemes required
    if (
        hasUsableContent &&
        activeContent
    ) {
        try {
            // Build the acitivty based on selected word list, phoneme and theme 
            standaloneHtml =
                buildStandaloneWordSearchHtml(
                    config,
                    {
                        words:
                            activeContent.words,
                        phonemes:
                            activeContent.phonemes,
                    },
                    resolvedTheme,
                );
        } catch (error) { // throws error if could not generate - unplaced word, too long ect. Displayed on UI 
            generationError =
                error instanceof Error
                    ? error.message
                    : "The puzzle could not be generated.";
        }
    }

    /**  This is a React 'functional update' 
        * essensially this handles an edge case: where multiple updates are queued e.g. a user clicks regen multiple times quickly 
        * It handles this edge case via this function as we pass react the function and it calcs the value 
        * if I used say setSeed(seed + 1); and a user spamed the button then a value may be lost before React could update anything 
    */
    function regeneratePuzzle() {
        // Functional updates remain correct during rapid clicks.
        setSeed((currentSeed) =>
            currentSeed >=
                POSTGRES_INTEGER_MAXIMUM
                ? 1
                : currentSeed + 1,
        );

        setDownloadStatus("");
    }
    // Downloads the currently generated Word Search as an HTML file
    function handleDownload() {
        // If standaloneHtml does not exist break.
        if (!standaloneHtml) {
            return;
        }

        // else, name the file
        const filename =
            `orate-word-search-${config.difficulty}-${config.seed}.html`;

        // and give the generated HTML to the browser as a downloadable file
        downloadHtmlFile(
            filename,
            standaloneHtml,
        );

        // display which file was successfully downloaded.
        setDownloadStatus(
            `Downloaded ${filename}. Open it in a browser to test the learner activity.`,
        );
    }

    return (
        <div className="mt-12 grid gap-(--panel-spacing) lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside
                className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) text-foreground shadow-sm"
                aria-labelledby="word-search-controls-heading"
            >
                <p className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                    Teacher controls
                </p>

                <h2
                    id="word-search-controls-heading"
                    className="mt-1 text-2xl font-semibold"
                >
                    Configure the Word Search
                </h2>

                <div className="mt-6">
                    <label
                        htmlFor="word-search-list"
                        className="block font-semibold text-foreground"
                    >
                        Word list
                    </label>

                    <p
                        id="word-search-list-help"
                        className="mt-1 text-sm text-(--muted-text)"
                    >
                        Every word in the selected list will be placed
                        in the puzzle.
                    </p>

                    <select
                        id="word-search-list"
                        name="wordSearchList"
                        value={selectedListId}
                        disabled={
                            listsState !== "ready" ||
                            wordLists.length === 0
                        }
                        aria-describedby="word-search-list-help"
                        onChange={(event) => {
                            setDownloadStatus("");
                            selectList(
                                event.target.value,
                            );
                        }}
                        className="mt-3 w-full rounded-lg border border-(--control-border) bg-(--surface) px-3 py-2 text-foreground transition-colors focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {wordLists.length === 0 ? (
                            <option value="">
                                No word lists available
                            </option>
                        ) : (
                            wordLists.map((wordList) => (
                                <option
                                    key={wordList.id}
                                    value={wordList.id}
                                >
                                    {wordList.name}
                                    {" - "}
                                    {wordList.wordCount}
                                    {" words"}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div
                    className="mt-4 space-y-3"
                    aria-live="polite"
                >
                    {listsState === "loading" ? (
                        <p className="text-sm text-(--muted-text)">
                            Loading word lists…
                        </p>
                    ) : null}

                    {listsState === "error" ? (
                        <div>
                            <p
                                role="alert"
                                className="text-sm text-(--danger)"
                            >
                                {errorMessage}
                            </p>

                            <button
                                type="button"
                                onClick={reloadLists}
                                className="mt-3 rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                            >
                                Retry word lists
                            </button>
                        </div>
                    ) : null}

                    {listsState === "ready" &&
                        wordLists.length === 0 ? (
                        <p className="text-sm text-(--muted-text)">
                            Create a word list in the Library before
                            building a Word Search.
                        </p>
                    ) : null}

                    {contentState === "loading" ? (
                        <p className="text-sm text-(--muted-text)">
                            Loading activity content…
                        </p>
                    ) : null}

                    {contentState === "error" ? (
                        <div>
                            <p
                                role="alert"
                                className="text-sm text-(--danger)"
                            >
                                {errorMessage}
                            </p>

                            <button
                                type="button"
                                onClick={reloadContent}
                                className="mt-3 rounded-lg border border-(--control-border) bg-(--surface-muted) px-4 py-2 font-semibold text-foreground hover:border-(--accent) hover:bg-(--accent-soft) hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                            >
                                Retry list content
                            </button>
                        </div>
                    ) : null}

                    {activeContent &&
                        activeContent.words.length === 0 ? (
                        <p className="text-sm text-(--muted-text)">
                            This list is empty. Add words in the Library
                            before using it.
                        </p>
                    ) : null}
                </div>

                {generationError ? (
                    <p
                        role="alert"
                        className="mt-4 text-sm text-(--danger)"
                    >
                        {generationError}
                    </p>
                ) : null}

                <fieldset className="mt-6">
                    <legend className="font-semibold text-foreground">
                        Difficulty
                    </legend>

                    <p className="mt-1 text-sm text-(--muted-text)">
                        Difficulty changes the grid size and allowed directions.
                    </p>

                    <div className="mt-3 space-y-(--control-spacing)">
                        {DIFFICULTY_ORDER.map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--control-border) bg-(--surface) p-3 transition-colors hover:border-(--accent) hover:bg-(--accent-soft)"
                            >
                                <input
                                    type="radio"
                                    name="word-search-difficulty"
                                    value={option}
                                    checked={
                                        difficulty === option
                                    }
                                    onChange={() => {
                                        setDifficulty(option);
                                        setDownloadStatus("");
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-(--action) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                />

                                <span>
                                    <strong className="block text-foreground">
                                        {
                                            DIFFICULTY_DETAILS[
                                                option
                                            ].label
                                        }
                                    </strong>

                                    <span className="mt-1 block text-sm text-(--muted-text)">
                                        {
                                            WORD_SEARCH_DIFFICULTY_DESCRIPTIONS[
                                            option
                                            ]
                                        }
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-(--control-border) bg-(--surface) p-4 transition-colors hover:border-(--accent) hover:bg-(--accent-soft)">
                    <span>
                        <strong className="block text-foreground">
                            Show English hints
                        </strong>

                        <span className="mt-1 block text-sm text-(--muted-text)">
                            Display the English word beneath each IPA target.
                        </span>
                    </span>

                    <input
                        type="checkbox"
                        checked={hintsEnabled}
                        onChange={(changeEvent) => {
                            setHintsEnabled(changeEvent.target.checked);
                            setDownloadStatus("");
                        }}
                        className="mt-1 h-5 w-5 shrink-0 accent-(--action) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    />
                </label>

                <div className="mt-6 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
                    <p className="text-sm text-(--muted-text)">
                        Puzzle seed
                    </p>

                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                        {seed}
                    </p>

                    <button
                        type="button"
                        disabled={!hasUsableContent}
                        onClick={regeneratePuzzle}
                        className="mt-4 w-full rounded-lg bg-(--action) px-4 py-2 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Regenerate puzzle
                    </button>
                </div>

                <div className="mt-8 border-t border-(--border) pt-6">
                    <h3 className="font-semibold text-foreground">
                        Download learner activity
                    </h3>

                    <p className="mt-1 text-sm text-(--muted-text)">
                        Generate one playable HTML file using the current puzzle settings.
                    </p>

                    <button
                        type="button"
                        disabled={!standaloneHtml}
                        onClick={handleDownload}
                        className="mt-4 w-full rounded-lg bg-(--action) px-5 py-3 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
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
            </aside>
            {standaloneHtml ? (
                <ActivityPreview
                    html={standaloneHtml}
                    title={`Playable ${config.difficulty} phoneme Word Search preview`}
                    height={1000}
                />
            ) : (
                <section
                    aria-labelledby="word-search-preview-unavailable-heading"
                    className="rounded-2xl border border-(--border) bg-(--surface) p-(--panel-spacing) shadow-sm"
                >
                    <p className="text-sm font-semibold uppercase tracking-wider text-(--accent)">
                        Learner view
                    </p>

                    <h2
                        id="word-search-preview-unavailable-heading"
                        className="mt-1 text-2xl font-semibold text-foreground"
                    >
                        Preview unavailable
                    </h2>

                    <p className="mt-2 text-sm text-(--muted-text)">
                        {generationError
                            ? "Resolve the generation error before previewing or downloading."
                            : "Choose a populated word list to generate the puzzle."}
                    </p>
                </section>
            )}
        </div>
    );
}