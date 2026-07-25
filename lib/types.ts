/**
 * Describes one selectable phoneme word.
 * The ID is used internally, while 'english' and 'ipa' are displayed to
 * teachers and learners.
 */

export interface PhonemeWord { // interface = schema similar to JSON 
    readonly id: string;
    readonly english: string;
    readonly ipa: string;
}