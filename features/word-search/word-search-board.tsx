"use client";

import { useState } from "react";
import { getPhoneme } from "@/lib/phoneme-definitions";
import { WORD_SEARCH_WORDS } from "@/lib/phonemes";
import type { GridCoordinate, PlacedWord, WordSearchPuzzle } from "@/lib/types";

interface WordSearchBoardProps {
    readonly puzzle: WordSearchPuzzle;
    readonly hintsEnabled: boolean;
}

// Compare two grid co-ords by value 
function coordinatesAreEqual(
    first: GridCoordinate,
    second: GridCoordinate,
): boolean {
    return (
        first.row === second.row &&
        first.column === second.column
    );
}

// Determine if the two selected endpoints match a placement 
// Both directions are accepted - can select a word from beginning to end or end to beginning

function placementMatchesEndpoints(
    placement: PlacedWord,
    start: GridCoordinate,
    end: GridCoordinate,
): boolean {
    const firstCoordinate = placement.coordinates[0];

    const lastCoordinate = placement.coordinates[
        placement.coordinates.length - 1
    ];

    if (!firstCoordinate || !lastCoordinate) {
        return false;
    }

    const matchesForward =
        coordinatesAreEqual(firstCoordinate, start) &&
        coordinatesAreEqual(lastCoordinate, end);

    const matchesBackward =
        coordinatesAreEqual(firstCoordinate, end) &&
        coordinatesAreEqual(lastCoordinate, start);

    return matchesForward || matchesBackward;
}

// Converts a coordinate into a value suitable for a React key or Set
function coordinateKey(coordinate: GridCoordinate): string {
    return `${coordinate.row}-${coordinate.column}`;
}

export function WordSearchGame({
    puzzle,
    hintsEnabled,
}: WordSearchBoardProps) {
    // null means the first endpoint has not been selected yet.
    const [selectionStart, setSelectionStart] =
        useState<GridCoordinate | null>(null);

    const [foundWordIds, setFoundWordIds] =
        useState<readonly string[]>([]);

    const [statusMessage, setStatusMessage] = useState(
        "Choose the first phoneme of a word.",
    );

    // Work out which cells belong to words that have already been found.
    // This information is derived from foundWordIds and the puzzle answer key

    const foundCoordinateKeys = new Set(
        puzzle.placements
            .filter((placement) =>
                foundWordIds.includes(placement.wordId)
            )
            .flatMap((placement) =>
                placement.coordinates.map(coordinateKey),
            ),
    );

    function selectCell(coordinate: GridCoordinate) {
        // The first click records the starting endpoint
        if (selectionStart === null) {
            setSelectionStart(coordinate);
            setStatusMessage("Start selected. Now choose the final phoneme");

            return;
        }

        // Clicking the selected cell again cancels the current selection.
        if (coordinatesAreEqual(selectionStart, coordinate)) {
            setSelectionStart(null);
            setStatusMessage("Selection cleared. Choose a new starting phoneme.");
            return;
        }

        // The second click searches the generated answer key for a placement with matching endpoints
        const matchingPlacement = puzzle.placements.find(
            (placement) =>
                placementMatchesEndpoints(
                    placement,
                    selectionStart,
                    coordinate,
                ),
        );

        // Every completed attempt clears the starting endpoint.
        setSelectionStart(null);

        if (!matchingPlacement) {
            setStatusMessage("That line is not one of the target words. Try again.",);
            return;
        }

        if (foundWordIds.includes(matchingPlacement.wordId)) {
            setStatusMessage("You have already found that word. Choose another.",);
            return;
        }

        const updatedFoundWordIds = [
            ...foundWordIds,
            matchingPlacement.wordId,
        ];

        setFoundWordIds(updatedFoundWordIds);

        const matchedWord = WORD_SEARCH_WORDS.find(
            (word) => word.id === matchingPlacement.wordId,
        );

        if (
            updatedFoundWordIds.length ===
            puzzle.placements.length
        ) {
            setStatusMessage("Well done! You found every phoneme word.",);
            return;
        }

        setStatusMessage(
            matchedWord
                ? `Found ${matchedWord.ipa}${hintsEnabled
                    ? ` — ${matchedWord.english}`
                    : ""
                }.`
                : "Word found!",
        );
    }

    function restartGame() {
        setSelectionStart(null);
        setFoundWordIds([]);
        setStatusMessage("Choose the first phoneme of a word.",);
    };


    return (
        <section
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="word-search-preview-heading"
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                        Learner preview
                    </p>

                    <h2
                        id="word-search-preview-heading"
                        className="mt-1 text-2xl font-semibold"
                    >
                        Find the phoneme words
                    </h2>
                </div>

                <div className="text-right">
                    <p className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        {puzzle.grid.length} × {puzzle.grid.length}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                        {foundWordIds.length} of{" "}
                        {puzzle.placements.length} found
                    </p>
                </div>
            </div>

            <p
                className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900"
                aria-live="polite"
            >
                {statusMessage}
            </p>

            <div
                role="group"
                aria-label={`${puzzle.grid.length} by ${puzzle.grid.length} interactive phoneme Word Search`}
                className="mx-auto mt-6 grid max-w-2xl gap-1"
                style={{
                    gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0, 1fr))`,
                }}
            >
                {puzzle.grid.map((row, rowIndex) =>
                    row.map((phonemeId, columnIndex) => {
                        const phoneme = getPhoneme(phonemeId);

                        const coordinate: GridCoordinate = {
                            row: rowIndex,
                            column: columnIndex,
                        };

                        const cellKey = coordinateKey(coordinate);

                        const isSelectionStart =
                            selectionStart !== null &&
                            coordinatesAreEqual(
                                selectionStart,
                                coordinate,
                            );

                        const isFound =
                            foundCoordinateKeys.has(cellKey);

                        const colourClasses = isSelectionStart
                            ? "border-blue-700 bg-blue-100 ring-2 ring-blue-300"
                            : isFound
                                ? "border-emerald-700 bg-emerald-100 text-emerald-950"
                                : "border-slate-300 bg-slate-50 text-slate-900 hover:border-blue-500 hover:bg-blue-50";

                        return (
                            <button
                                type="button"
                                key={cellKey}
                                onClick={() =>
                                    selectCell(coordinate)
                                }
                                aria-pressed={isSelectionStart}
                                aria-label={`${phoneme.spokenName}, row ${rowIndex + 1}, column ${columnIndex + 1}${isFound
                                        ? ", part of a found word"
                                        : ""
                                    }`}
                                title={`${phoneme.grapheme} as in ${phoneme.exampleWord}`}
                                className={`flex aspect-square min-w-0 items-center justify-center rounded-md border font-semibold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 ${colourClasses}`}
                            >
                                <span className="text-[0.6rem] sm:text-xs">
                                    /{phoneme.ipaSymbol}/
                                </span>
                            </button>
                        );
                    }),
                )}
            </div>

            <section
                className="mt-8 border-t border-slate-200 pt-6"
                aria-labelledby="word-bank-heading"
            >
                <div className="flex items-center justify-between gap-4">
                    <h3
                        id="word-bank-heading"
                        className="text-lg font-semibold"
                    >
                        Words to find
                    </h3>

                    <button
                        type="button"
                        onClick={restartGame}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                        Restart
                    </button>
                </div>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {WORD_SEARCH_WORDS.map((word) => {
                        const isFound =
                            foundWordIds.includes(word.id);

                        return (
                            <li
                                key={word.id}
                                aria-label={`${word.ipa}, ${isFound
                                        ? "found"
                                        : "not found"
                                    }`}
                                className={`rounded-lg px-4 py-3 ${isFound
                                        ? "bg-emerald-100 text-emerald-950"
                                        : "bg-slate-50"
                                    }`}
                            >
                                <strong
                                    className={`block ${isFound
                                            ? "line-through"
                                            : "text-blue-700"
                                        }`}
                                >
                                    {word.ipa}
                                </strong>

                                {hintsEnabled && (
                                    <span className="mt-1 block text-sm">
                                        {word.english}
                                    </span>
                                )}

                                {isFound && (
                                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wide">
                                        Found
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </section>
    );
}
