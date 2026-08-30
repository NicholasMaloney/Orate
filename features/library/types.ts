// Public word-list summary returned by the collection API.
export interface WordListSummary {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly wordCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
}

// One ordered phoneme record returned by the word API.
export interface PhonemeRecord {
    readonly id: string;
    readonly position: number;
    readonly ipaSymbol: string;
    readonly grapheme: string;
    readonly exampleWord: string;
    readonly spokenName: string;
}

// A complete database-backed word and its ordered phonemes.
export interface WordRecord {
    readonly id: string;
    readonly wordListId: string;
    readonly english: string;
    readonly ipa: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly phonemes: readonly PhonemeRecord[];
}

// Detailed word-list responses include the words stored in the list.
export interface WordListDetail extends WordListSummary {
    readonly words: readonly WordRecord[];
}

// The client key keeps unsaved phoneme controls stable while reordering.
export interface PhonemeTokenDraft {
    readonly key: string;
    readonly ipaSymbol: string;
    readonly grapheme: string;
    readonly exampleWord: string;
    readonly spokenName: string;
}