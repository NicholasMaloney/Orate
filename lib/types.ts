
// Describes one phonetic sound and the info used to present it
export interface Phoneme {
    readonly id: string;        // unique ID
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
    readonly phonemeIds?: readonly string[];
}

// Describes a word which all phonemes have been recorded
// makes phonemeIdsrequired
export interface CompletePhonemeWord extends PhonemeWord {
    readonly phonemeIds: readonly string[];
}

// Database content serialized for activity builders.
export interface ActivityWordListData {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly words: readonly CompletePhonemeWord[];
    readonly phonemes: readonly Phoneme[];
}

// Resolved target and keyboard bank for one Wordle.
export interface WordleActivityContent {
    readonly selectedWord: CompletePhonemeWord;
    readonly phonemes: readonly Phoneme[];
}

// Resolved words and filler bank for one Word Search.
export interface WordSearchActivityContent {
    readonly words: readonly CompletePhonemeWord[];
    readonly phonemes: readonly Phoneme[];
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

// Wordle Config Data Transfer Object (DTO)
// Public JSON returned for a saved Wordle configuration.
export interface WordleConfigurationRecord {
    readonly id: string;
    readonly name: string;
    readonly wordId: string;
    readonly difficulty: Difficulty;
    readonly hintsEnabled: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly word: {
        readonly id: string;
        readonly wordListId: string;
        readonly english: string;
        readonly ipa: string;
    };
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

// Word Search Config - Data Transfer Object (DTO)
// Public JSON returned for a saved Word Search configuration.
export interface WordSearchConfigurationRecord {
    readonly id: string;
    readonly name: string;
    readonly wordListId: string;
    readonly difficulty: Difficulty;
    readonly seed: number;
    readonly hintsEnabled: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly wordList: {
        readonly id: string;
        readonly name: string;
        readonly description: string | null;
        readonly wordCount: number;
    };
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

// The two activities used for the dashboard
export type DashboardActivityType = 
    | "wordle"
    | "word-search";

// Stores the dashboard totals for one activity type.
export interface DashboardActivitySummary {
    readonly activityType: DashboardActivityType;
    readonly createdCount: number;
    readonly successfulGenerationCocunt: number;
    readonly failedGenerationCount: number;
    readonly successRate: number | null;
}

// Stores the page-view information for one activity builder.
export interface DashboardPageAverage {
    readonly path: 
        | "/wordle"
        | "/word-search";
    readonly viewCount: number;
    readonly averageSeconds: number | null; 
}

// Describes one recently updated saved activity setup.
export interface DashboardConfigurationSummary {
    readonly id: string;
    readonly name: string;
    readonly activityType: DashboardActivityType;
    readonly difficulty: Difficulty;
    readonly updatedAt: string;
}

// Complete information returned by the dashboard API.
export interface DashboardData {
    readonly wordListCount: number;
    readonly wordCount: number;
    readonly phonemeCount: number;
    readonly emptyWordListCount: number;
    readonly generatedOutputCount: number;
    readonly failedGenerationCount: number;
    readonly averageTimeOnPageSeconds: number | null;
    readonly mostUsedActivityType: DashboardActivityType | null;
    readonly activities:
        readonly DashboardActivitySummary[];
    readonly pageAverages:
        readonly DashboardPageAverage[];
    readonly recentConfigurations:
        readonly DashboardConfigurationSummary[];
    readonly recordSources: {
        readonly live: number;
        readonly simulated: number;
    };
    readonly generatedAt: string;
}

export interface HealthStatusData {
    readonly status: "healthy";
    readonly database: "connected";
}