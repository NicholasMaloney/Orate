import type { 
    Word as DatabaseWord,
    WordList as DatabaseWordList,
    WordPhoneme as DatabaseWordPhoneme,
} from "@/build/generated/prisma/client"; 

import type { 
    CompletePhonemeWord,
    Phoneme,
}from "@/lib/types";

// Describes the database fields required to build one activity phoneme 
export type ActivityPhonemeRecord = Pick<
    DatabaseWordPhoneme,
    | "id"
    | "position"
    | "ipaSymbol"
    | "grapheme"
    | "exampleWord"
    | "spokenName"
>;

// Describes a database word loaded with its related phoneme records.
export type ActivityWordRecord = Pick<
    DatabaseWord,
    | "id"
    | "english"
    | "ipa"
> & {
    readonly phonemes: readonly ActivityPhonemeRecord[];
};

// Describe a database word list loaded with words and phonemes
export type ActivityWordListRecord = Pick<
    DatabaseWordList,
    | "id"
    | "name"
    | "description"
> & {
    readonly words: readonly ActivityWordRecord[];
}; 
// Contains the activity representation of one database word.
export interface ActivityWordData {
    readonly word: CompletePhonemeWord;
    readonly phonemes: readonly Phoneme[];
}

// Contains the serialisable activity content form one word list/ 
export interface ActivityWordListData {
    readonly id: string;
    readonly name: string;
    readonly description: string | null; 
    readonly words: readonly CompletePhonemeWord[]; 
    readonly phonemes: readonly Phoneme[]; 
}

// Converts one stored phoneme into Orate's display friendly domain type. 
function mapPhonemeRecord(
    phoneme: ActivityPhonemeRecord,
): Phoneme {
    return {
        id: phoneme.id,
        ipaSymbol: phoneme.ipaSymbol,
        grapheme: phoneme.grapheme,
        exampleWord: phoneme.exampleWord,
        spokenName: phoneme.spokenName,
    };
}

// Checks and orders the sequence before activity generation uses it. 
function orderPhonemeRecords( 
    word: ActivityWordRecord, 
): readonly ActivityPhonemeRecord[] {
    const orderedPhonemes = [...word.phonemes].sort(
        (first, second) => first.position - second.position,
    );

    if (orderedPhonemes.length === 0 ) {
        throw new Error( 
            `Word "${word.english}" does not contain any phonemes.`
        );
    }

    orderedPhonemes.forEach((phoneme, expectPosition) => {
        if (phoneme.position !== expectPosition) {
            throw new Error( 
                `Word "${word.english}" must use consecutive phoneme positions starting at zero.`,
            );
        }
    });

    return orderedPhonemes;
}

// Produces the word and phoneme definitions required by an activity.
export function mapWordRecordToActivityData(
    word: ActivityWordRecord,
): ActivityWordData { 
    const orderedPhonemes = orderPhonemeRecords(word);

    return {
        word: {
            id: word.id,
            english: word.english,
            ipa: word.ipa,
            phonemeIds: orderedPhonemes.map((phoneme) => phoneme.id,),
        },
        phonemes: orderedPhonemes.map(mapPhonemeRecord),
    };
}

// Converts a complete database list into serialisable activity content
export function mapWordListRecordToActivityData(
    wordList: ActivityWordListRecord,
): ActivityWordListData { 
    const mappedWords = wordList.words.map(
        mapWordRecordToActivityData,
    );

    return {
        id: wordList.id,
        name: wordList.name,
        description: wordList.description,
        words: mappedWords.map(({ word }) => word),
        phonemes: mappedWords.flatMap(
            ({ phonemes }) => phonemes,
        ),
    };
}