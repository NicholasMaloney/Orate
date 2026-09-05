import type { Phoneme } from "@/lib/types";


// speech sounds used by Worlde 
export const PHONEMES: readonly Phoneme[] = [
    {
        id: "theta",
        ipaSymbol: "θ",
        grapheme: "TH",
        exampleWord: "thin",
        spokenName: "voiceless th",
    },
    {
        id: "short-i",
        ipaSymbol: "ɪ",
        grapheme: "I",
        exampleWord: "sit",
        spokenName: "short i",
    },
    {
        id: "n",
        ipaSymbol: "n",
        grapheme: "N",
        exampleWord: "net",
        spokenName: "n",
    },
    {
        id: "sh",
        ipaSymbol: "ʃ",
        grapheme: "SH",
        exampleWord: "ship",
        spokenName: "sh",
    },
    {
        id: "p",
        ipaSymbol: "p",
        grapheme: "P",
        exampleWord: "pen",
        spokenName: "p",
    },
    {
        id: "ch",
        ipaSymbol: "tʃ",
        grapheme: "CH",
        exampleWord: "chin",
        spokenName: "ch",
    },
    {
        id: "j",
        ipaSymbol: "dʒ",
        grapheme: "J",
        exampleWord: "jam",
        spokenName: "j",
    },
    {
        id: "short-a",
        ipaSymbol: "æ",
        grapheme: "A",
        exampleWord: "cat",
        spokenName: "short a",
    },
    {
        id: "m",
        ipaSymbol: "m",
        grapheme: "M",
        exampleWord: "map",
        spokenName: "m",
    },
    {
        id: "f",
        ipaSymbol: "f",
        grapheme: "F",
        exampleWord: "fan",
        spokenName: "f",
    },
]

// maps each phoneme ID to its full object, e.g. theta -> id = theta, ipa symbol = θ
const PHONEME_BY_ID = new Map(
    // Convert each phoneme into a [key, value] pair that Map understands.
    PHONEMES.map((phoneme) => [phoneme.id, phoneme] as const),  
);

// Find and return one phoneme using its unique ID.
export function getPhoneme(phonemeId: string): Phoneme {
    const phoneme = PHONEME_BY_ID.get(phonemeId);
    
    // throws an error if  the ID does not exist 
    if (!phoneme) {
        throw new Error(`Unknown phoneme: ${phonemeId}`)
    }

    return phoneme;
}