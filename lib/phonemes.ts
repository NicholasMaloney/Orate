import type { PhonemeWord, CompletePhonemeWord, } from "@/lib/types";

// Fix list of word choices shared between wordle and word search 
// Acts as a source of truth 

export const PHONEME_WORDS: readonly PhonemeWord[] = [
    // 3 phonemes
    {
        id: "bed",
        english: "bed",
        ipa: "/bed/",
    },
    {
        id: "bid",
        english: "bid",
        ipa: "/bɪd/",
    },
    {
        id: "bad",
        english: "bad",
        ipa: "/bæd/",
    },
    {
        id: "bud",
        english: "bud",
        ipa: "/bɐd/",
    },
    {
        id: "bird",
        english: "bird",
        ipa: "/bɜːd/",
    },
    {
        id: "bark",
        english: "bark",
        ipa: "/bɐːk/",
    },
    {
        id: "book",
        english: "book",
        ipa: "/bʊk/",
    },
    {
        id: "boot",
        english: "boot",
        ipa: "/bʉːt/",
    },
    {
        id: "boat",
        english: "boat",
        ipa: "/bəʉt/",
    },
    {
        id: "bike",
        english: "bike",
        ipa: "/bɑek/",
    },
    {
        id: "bait",
        english: "bait",
        ipa: "/bæɪt/",
    },
    {
        id: "boil",
        english: "boil",
        ipa: "/boɪl/",
    },
    {
        id: "beard",
        english: "beard",
        ipa: "/bɪəd/",
    },
    {
        id: "choice",
        english: "choice",
        ipa: "/tʃoɪs/",
    },
    {
        id: "thin",
        english: "thin",
        ipa: "/θɪn/",
        phonemeIds: ["theta", "short-i", "n"],
    },
    {
        id: "then",
        english: "then",
        ipa: "/ðen/",
    },
    {
        id: "ship",
        english: "ship",
        ipa: "/ʃɪp/",
        phonemeIds: ["sh", "short-i", "p"],
    },
    {
        id: "chin",
        english: "chin",
        ipa: "/tʃɪn/",
        phonemeIds: ["ch", "short-i", "n"],
    },
    {
        id: "jam",
        english: "jam",
        ipa: "/dʒæm/",
        phonemeIds: ["j", "short-a", "m"],
    },
    {
        id: "yes",
        english: "yes",
        ipa: "/jes/",
    },
    {
        id: "win",
        english: "win",
        ipa: "/wɪn/",
    },
    {
        id: "ring",
        english: "ring",
        ipa: "/ɹɪŋ/",
    },
    {
        id: "log",
        english: "log",
        ipa: "/lɔɡ/",
    },
    {
        id: "fan",
        english: "fan",
        ipa: "/fæn/",
        phonemeIds: ["f", "short-a", "n"],
    },
    {
        id: "van",
        english: "van",
        ipa: "/væn/",
    },
    {
        id: "sun",
        english: "sun",
        ipa: "/sɐn/",
    },
    {
        id: "zip",
        english: "zip",
        ipa: "/zɪp/",
    },
    {
        id: "gum",
        english: "gum",
        ipa: "/ɡɐm/",
    },
    {
        id: "hat",
        english: "hat",
        ipa: "/hæt/",
    },
    {
        id: "fork",
        english: "fork",
        ipa: "/foːk/",
    },

    // 4 phonemes
    {
        id: "stop",
        english: "stop",
        ipa: "/stɔp/",
    },
    {
        id: "frog",
        english: "frog",
        ipa: "/fɹɔɡ/",
    },
    {
        id: "clap",
        english: "clap",
        ipa: "/klæp/",
    },
    {
        id: "slip",
        english: "slip",
        ipa: "/slɪp/",
    },
    {
        id: "drum",
        english: "drum",
        ipa: "/dɹɐm/",
    },
    {
        id: "grin",
        english: "grin",
        ipa: "/ɡɹɪn/",
    },
    {
        id: "train",
        english: "train",
        ipa: "/tɹæɪn/",
    },
    {
        id: "cloud",
        english: "cloud",
        ipa: "/klæɔd/",
    },
    {
        id: "snake",
        english: "snake",
        ipa: "/snæɪk/",
    },
    {
        id: "smile",
        english: "smile",
        ipa: "/smɑel/",
    },
    {
        id: "milk",
        english: "milk",
        ipa: "/mɪlk/",
    },
    {
        id: "hand",
        english: "hand",
        ipa: "/hænd/",
    },
    {
        id: "tent",
        english: "tent",
        ipa: "/tent/",
    },
    {
        id: "jump",
        english: "jump",
        ipa: "/dʒɐmp/",
    },
    {
        id: "lamp",
        english: "lamp",
        ipa: "/læmp/",
    },
    {
        id: "bank",
        english: "bank",
        ipa: "/bæŋk/",
    },
    {
        id: "frame",
        english: "frame",
        ipa: "/fɹæɪm/",
    },
    {
        id: "cold",
        english: "cold",
        ipa: "/kəʉld/",
    },
    {
        id: "wind",
        english: "wind",
        ipa: "/wɪnd/",
    },
    {
        id: "soft",
        english: "soft",
        ipa: "/sɔft/",
    },
    {
        id: "gift",
        english: "gift",
        ipa: "/ɡɪft/",
    },
    {
        id: "desk",
        english: "desk",
        ipa: "/desk/",
    },
    {
        id: "left",
        english: "left",
        ipa: "/left/",
    },
    {
        id: "pond",
        english: "pond",
        ipa: "/pɔnd/",
    },
    {
        id: "golf",
        english: "golf",
        ipa: "/ɡɔlf/",
    },
    {
        id: "silk",
        english: "silk",
        ipa: "/sɪlk/",
    },
    {
        id: "great",
        english: "great",
        ipa: "/gɹæɪt/",
    },
    {
        id: "crab",
        english: "crab",
        ipa: "/kɹæb/",
    },
    {
        id: "plug",
        english: "plug",
        ipa: "/plɐɡ/",
    },
    {
        id: "quiz",
        english: "quiz",
        ipa: "/kwɪz/",
    },

    // 5 phonemes
    {
        id: "stamp",
        english: "stamp",
        ipa: "/stæmp/",
    },
    {
        id: "plant",
        english: "plant",
        ipa: "/plænt/",
    },
    {
        id: "blank",
        english: "blank",
        ipa: "/blæŋk/",
    },
    {
        id: "grand",
        english: "grand",
        ipa: "/ɡɹænd/",
    },
    {
        id: "clamp",
        english: "clamp",
        ipa: "/klæmp/",
    },
    {
        id: "twist",
        english: "twist",
        ipa: "/twɪst/",
    },
    {
        id: "trust",
        english: "trust",
        ipa: "/tɹɐst/",
    },
    {
        id: "drink",
        english: "drink",
        ipa: "/dɹɪŋk/",
    },
    {
        id: "brisk",
        english: "brisk",
        ipa: "/bɹɪsk/",
    },
    {
        id: "shrimp",
        english: "shrimp",
        ipa: "/ʃɹɪmp/",
    },
    {
        id: "scrap",
        english: "scrap",
        ipa: "/skɹæp/",
    },
    {
        id: "scribe",
        english: "scribe",
        ipa: "/skɹɑeb/",
    },
    {
        id: "scream",
        english: "scream",
        ipa: "/skɹiːm/",
    },
    {
        id: "splash",
        english: "splash",
        ipa: "/splæʃ/",
    },
    {
        id: "spring",
        english: "spring",
        ipa: "/spɹɪŋ/",
    },
    {
        id: "strap",
        english: "strap",
        ipa: "/stɹæp/",
    },
    {
        id: "street",
        english: "street",
        ipa: "/stɹiːt/",
    },
    {
        id: "scrub",
        english: "scrub",
        ipa: "/skɹɐb/",
    },
    {
        id: "flask",
        english: "flask",
        ipa: "/flɐːsk/",
    },
    {
        id: "clasp",
        english: "clasp",
        ipa: "/klɐːsp/",
    },
    {
        id: "cleft",
        english: "cleft",
        ipa: "/kleft/",
    },
    {
        id: "glint",
        english: "glint",
        ipa: "/ɡlɪnt/",
    },
    {
        id: "blend",
        english: "blend",
        ipa: "/blend/",
    },
    {
        id: "strain",
        english: "strain",
        ipa: "/stɹæɪn/",
    },
    {
        id: "thrust",
        english: "thrust",
        ipa: "/θɹɐst/",
    },
    {
        id: "sprawl",
        english: "sprawl",
        ipa: "/spɹoːl/",
    },
    {
        id: "scrawl",
        english: "scrawl",
        ipa: "/skɹoːl/",
    },
    {
        id: "sprig",
        english: "sprig",
        ipa: "/spɹɪɡ/",
    },
    {
        id: "sprout",
        english: "sprout",
        ipa: "/spɹæɔt/",
    },
    {
        id: "smoked",
        english: "smoked",
        ipa: "/sməʉkt/",
    },
]; 

// Returns a given word if it has a complete phoneme sequence i.e a compelte word
export function isCompletePhonemeWord(
  word: PhonemeWord,
): word is CompletePhonemeWord {
  return word.phonemeIds !== undefined && word.phonemeIds.length > 0;
}

//  Wordle currently exposes only words with complete token data.
export const WORDLE_WORDS = PHONEME_WORDS.filter(isCompletePhonemeWord);

// Finds a word based on its ID and confirms that it is a valid word by comparing its ID
export function getWord(wordID:string): PhonemeWord {
    const word = PHONEME_WORDS.find((candidate) => candidate.id === wordID);

    if (!word) {
        throw new Error(`Unknown phoneme word: ${wordID}`)
    }

    return word;
}

// gets a word for wordle that is a Complete phoneme word
export function getWordleWord(wordId: string): CompletePhonemeWord {
    const word = getWord(wordId);

    if (!isCompletePhonemeWord(word)) {
        throw new Error(`Word is not ready for Wordle: ${wordId}`);
    }

    return word;
}

// Word Seach feature starts here: 
// Word Search uses the same fixed collection of fully recorded phoneme words.
export const WORD_SEARCH_WORDS: readonly CompletePhonemeWord[] =
    WORDLE_WORDS;