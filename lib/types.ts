
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