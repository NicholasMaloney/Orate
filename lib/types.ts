
// Describes one phonetic sound and the info used to present it
export interface Phoneme {
    readonly id : string;        // unique ID
    readonly ipaSymbol: string;
    readonly grapheme: string;   // how the phoneme is writen in english
    readonly exampleWord: string;    // use case example
    readonly spokenName: string; // pronounciation
}

/**
 * Describes one selectable phoneme word.
 * The ID is used internally, while 'english' and 'ipa' are displayed to
 * teachers and learners.
 */
export interface PhonemeWord { // interface = schema similar to JSON 
    readonly id: string;
    readonly english: string;
    readonly ipa: string;      // the IPA transcription of the entire word
    readonly phonemeIds?: readonly string [];
}

// Describes a word which all phonemes have been recorded
    // makes phonemeIdsrequired
export interface CompletePhonemeWord extends PhonemeWord {
    readonly phonemeIds: readonly string[];
}

// Difficulty values that will be accepted by Wordle and Word search 
export type Difficulty = "easy" | "standard" | "challenging"

// Colour palettes supported by the teacher interface. Not the activities
// The concrete palette currently displayed by the application.
export type ResolvedTheme =
    | "light"
    | "dark";

// The teacher may select a concrete palette or follow the browser.
export type Theme =
    | ResolvedTheme
    | "system";

//Controls how much spacing the teacher interface uses.

export type LayoutDensity =
    "comfortable" | "compact";

//Groups all preferences that should persist between visits.
export interface PreferenceState {
    readonly theme: Theme;
    readonly density: LayoutDensity;
}

// Settings / config for teachers when creating a Wordle activity - will be used later for the game export function 
export interface WordleConfig {
    readonly wordId: string;
    readonly difficulty: Difficulty;
    readonly hintsEnabled: boolean;
}

// Describes how a guessed phoneme relates to the target word. 
    // correct = right phoneme, right pos
    // present = right phoneme, different pos
    // absent = either not contained in the word or the guessed phoneme has no remaining match
export type GuessState = "correct" | "present" | "absent";

/** ~~~~~~ This is where the Word-Search feature starts ~~~~~~ */

// Settings selected by the teacher when creating a Word Search.
export interface WordSearchConfig {
    readonly difficulty: Difficulty;
    readonly seed: number;
    readonly hintsEnabled: boolean;
}

// Identifies one cell within the Word Search grid.
export interface GridCoordinate {
    readonly row: number;
    readonly column: number;
}

// Records where one hidden word was placed.
// These coordinates also act as the puzzle's answer key.
export interface PlacedWord {
    readonly wordId: string;
    readonly coordinates: readonly GridCoordinate[];
}

// The completed puzzle returned by the generator.
export interface WordSearchPuzzle {
    // Each string is a phoneme ID, rather than the displayed IPA symbol.
    readonly grid: readonly (readonly string[])[];

    // Records the hidden location of each word.
    readonly placements: readonly PlacedWord[];

    // Records which seed produced this puzzle.
    readonly seed: number;
}