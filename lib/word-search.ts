/**
 * Deterministic Word Search generation.
 *
 * Given the same configuration and word collection, this function always
 * returns the same grid. This allows the React preview and downloaded HTML
 * activity to generate matching puzzles.
 */
import { PHONEMES } from "@/lib/phoneme-definitions";
import { WORD_SEARCH_WORDS } from "@/lib/phonemes";
import type {
    CompletePhonemeWord,
    Difficulty,
    PlacedWord,
    WordSearchConfig,
    WordSearchPuzzle,
} from "@/lib/types";

/**
 * A direction describes how the row and column change when moving from one
 * phoneme to the next.
 *
 * [0, 1]  = right
 * [1, 0]  = down
 * [1, 1]  = diagonally down and right
 * [-1, 0] = up
 */
type GridDirection = readonly [
    rowChange: number,
    columnChange: number,
];

// Difficulty controls which directions the generator may use.

const DIRECTIONS: Readonly<
    Record<Difficulty, readonly GridDirection[]>
> = {
    easy: [
        [0, 1],
        [1, 0],
    ],

    standard: [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ],

    challenging: [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
    ],
};

// Difficulty also controls the grid dimensions.

const GRID_SIZES: Readonly<Record<Difficulty, number>> = {
    easy: 8,
    standard: 10,
    challenging: 12,
};

/**
 * Creates a predictable pseudo-random number generator.
 * Unlike Math.random(), this generator produces the same number sequence 
 * whenever it receives the same starting seed.
 */
function createSeededRandom(seed: number): () => number {
    // Convert decimals and negative seeds into a valid positive integer.
    let state = Math.abs(Math.trunc(seed)) % 2147483647;

    // Zero cannot be used as the starting state for this algorithm.
    if (state === 0) {
        state = 1;
    }

    /**
     * This returned function is a closure. It remembers and updates `state`
     * every time it is called.
     */
    return () => {
        state = (state * 16807) % 2147483647;

        // Convert the generated integer into a decimal from 0 up to, but not
        // including, 1. This gives it behaviour similar to Math.random().
        return (state - 1) / 2147483646;
    };
}

/**
 * Converts a random decimal into a valid array index.
 */
function randomIndex(
    random: () => number,
    arrayLength: number,
): number {
    return Math.floor(random() * arrayLength);
}

/**
 * Generates a completed Word Search puzzle.
 */
export function generateWordSearch(
    config: WordSearchConfig,
    words: readonly CompletePhonemeWord[] = WORD_SEARCH_WORDS,
): WordSearchPuzzle {
    const gridSize = GRID_SIZES[config.difficulty];
    const allowedDirections = DIRECTIONS[config.difficulty];
    const random = createSeededRandom(config.seed);

    /**
     * The grid begins with null values because no phonemes have been placed.
     * Array.from creates a separate array for every row.
     */
    const grid: (string | null)[][] = Array.from(
        { length: gridSize },
        () => Array<string | null>(gridSize).fill(null),
    );

    const placements: PlacedWord[] = [];

    // Attempt to place every word in the fixed word collection.
    for (const word of words) {
        let wordWasPlaced = false;

        /**
         * Try different starting cells and directions.
         *
         * The limit prevents an infinite loop if a word cannot be placed.
         */
        for (
            let attempt = 0;
            attempt < 600 && !wordWasPlaced;
            attempt += 1
        ) {
            const direction =
                allowedDirections[
                    randomIndex(random, allowedDirections.length)
                ];

            const [rowChange, columnChange] = direction;

            const startRow = randomIndex(random, gridSize);
            const startColumn = randomIndex(random, gridSize);

            const endRow =
                startRow +
                rowChange * (word.phonemeIds.length - 1);

            const endColumn =
                startColumn +
                columnChange * (word.phonemeIds.length - 1);

            // Reject a placement if its final cell would leave the grid.
            const endsOutsideGrid =
                endRow < 0 ||
                endRow >= gridSize ||
                endColumn < 0 ||
                endColumn >= gridSize;

            if (endsOutsideGrid) {
                continue;
            }

            /**
             * Calculate the coordinate occupied by every phoneme.
             *
             * For example, placing a three-phoneme word from row 2, column 1
             * using direction [0, 1] produces:
             *
             * [2, 1] → [2, 2] → [2, 3]
             */
            const coordinates = word.phonemeIds.map(
                (_, phonemePosition) => ({
                    row:
                        startRow +
                        rowChange * phonemePosition,
                    column:
                        startColumn +
                        columnChange * phonemePosition,
                }),
            );

            /**
             * A word may use:
             * - an empty cell; or
             * - a cell containing the same phoneme.
             *
             * It cannot overwrite a different phoneme.
             */
            const placementFits = coordinates.every(
                ({ row, column }, phonemePosition) => {
                    const existingPhonemeId = grid[row][column];
                    const requiredPhonemeId =
                        word.phonemeIds[phonemePosition];

                    return (
                        existingPhonemeId === null ||
                        existingPhonemeId === requiredPhonemeId
                    );
                },
            );

            if (!placementFits) {
                continue;
            }

            // Commit the placement only after every coordinate is validated.
            coordinates.forEach(
                ({ row, column }, phonemePosition) => {
                    grid[row][column] =
                        word.phonemeIds[phonemePosition];
                },
            );

            placements.push({
                wordId: word.id,
                coordinates,
            });

            wordWasPlaced = true;
        }

        if (!wordWasPlaced) {
            throw new Error(
                `Unable to place ${word.id} in the Word Search grid.`,
            );
        }
    }

    /**
     * Fill every remaining empty cell with a distractor phoneme.
     *
     * We use the same seeded generator, so the filler cells are also
     * deterministic.
     */
    const fillerPhonemeIds = PHONEMES.map(
        (phoneme) => phoneme.id,
    );

    const completedGrid = grid.map((row) =>
        row.map(
            (cell) =>
                cell ??
                fillerPhonemeIds[
                    randomIndex(random, fillerPhonemeIds.length)
                ],
        ),
    );

    return {
        grid: completedGrid,
        placements,
        seed: config.seed,
    };
}