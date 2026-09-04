import {
    describe,
    expect,
    it,
} from "vitest";
import type {
    WordleActivityContent,
    WordleConfig,
    WordSearchActivityContent,
    WordSearchConfig,
} from "@/lib/types";
import { buildStandaloneWordleHtml, buildStandaloneWordSearchHtml } from "@/lib/standalone";
import { scoreGuess } from "@/lib/wordle-scoring";

// A form of SQL injection, tests to make sure commone sybmols are sanatised before acception input. 
const TITLE_ATTACK =
    '</title><script>globalThis.pwned=true</script> & "quoted"';

const SCRIPT_ATTACK =
    "</script><script>alert(1)</script>";

const ATTRIBUTE_ATTACK =
    '"><svg onload=alert(1)>';

const MARKUP_ATTACK =
    "</span><img src=x onerror=alert(1)>";

const SEPARATOR_TEXT =
    "line\u2028paragraph\u2029end";

const HOSTILE_PHONEME = {
    id: "ipa-hostile",
    ipaSymbol: SCRIPT_ATTACK,
    grapheme: ATTRIBUTE_ATTACK,
    exampleWord: MARKUP_ATTACK,
    spokenName:
        `${SEPARATOR_TEXT} & sound`,
} as const;

const WORDLE_CONTENT:
    WordleActivityContent = {
    selectedWord: {
        id: "database-target",
        english: TITLE_ATTACK,
        ipa: `/${SCRIPT_ATTACK}/`,
        phonemeIds: [
            HOSTILE_PHONEME.id,
        ],
    },
    phonemes: [HOSTILE_PHONEME],
};

const WORDLE_CONFIG: WordleConfig = {
    wordId:
        WORDLE_CONTENT.selectedWord.id,
    difficulty: "standard",
    hintsEnabled: true,
};

const WORD_SEARCH_CONTENT:
    WordSearchActivityContent = {
    words: [
        {
            id: "database-search-word",
            english: MARKUP_ATTACK,
            ipa: "/x/",
            phonemeIds: [
                HOSTILE_PHONEME.id,
            ],
        },
    ],
    phonemes: [HOSTILE_PHONEME],
};

const WORD_SEARCH_CONFIG:
    WordSearchConfig = {
    difficulty: "easy",
    seed: 42,
    hintsEnabled: false,
};

function countOccurrences(
    value: string,
    part: string,
): number {
    return value.split(part).length - 1;
}

describe("standalone activity output", () => {
    it("escapes dynamic Wordle title text", () => {
        const html =
            buildStandaloneWordleHtml(
                WORDLE_CONFIG,
                WORDLE_CONTENT,
                "light",
            );

        expect(html).toContain(
            "<title>Orate Phoneme Wordle — " +
            "&lt;/title&gt;&lt;script&gt;" +
            "globalThis.pwned=true&lt;/script&gt; " +
            '&amp; "quoted"</title>',
        );

        expect(html).not.toContain(
            "<script>globalThis.pwned=true</script>",
        );

        expect(
            countOccurrences(
                html,
                "<title>",
            ),
        ).toBe(1);

        expect(
            countOccurrences(
                html,
                "</title>",
            ),
        ).toBe(1);
    });

    it("keeps hostile content inside script-safe JSON", () => {
        const html =
            buildStandaloneWordleHtml(
                WORDLE_CONFIG,
                WORDLE_CONTENT,
                "dark",
            );

        expect(
            countOccurrences(
                html,
                "<script>",
            ),
        ).toBe(1);

        expect(
            countOccurrences(
                html,
                "</script>",
            ),
        ).toBe(1);

        expect(html).not.toContain(
            SCRIPT_ATTACK,
        );

        expect(html).not.toContain(
            "<svg onload=alert(1)>",
        );

        expect(html).not.toContain(
            "<img src=x onerror=alert(1)>",
        );

        expect(html).not.toContain(
            String.fromCodePoint(0x2028),
        );

        expect(html).not.toContain(
            String.fromCodePoint(0x2029),
        );

        expect(html).toContain(
            "\\u003c/script\\u003e",
        );

        expect(html).toContain(
            "\\u003csvg onload=alert(1)\\u003e",
        );

        expect(html).toContain("\\u0026");
        expect(html).toContain("\\u2028");
        expect(html).toContain("\\u2029");
    });

    it("uses safe DOM construction and tested scoring", () => {
        const html =
            buildStandaloneWordleHtml(
                WORDLE_CONFIG,
                WORDLE_CONTENT,
                "light",
            );

        expect(html).not.toContain(
            "innerHTML",
        );

        expect(html).toContain(
            "board.replaceChildren()",
        );

        expect(html).toContain(
            "keyboard.replaceChildren()",
        );

        expect(html).toContain(
            "ipaLabel.textContent",
        );

        expect(html).toContain(
            scoreGuess.toString(),
        );
    });

    it("rejects content for another Wordle target", () => {
        expect(() =>
            buildStandaloneWordleHtml(
                {
                    ...WORDLE_CONFIG,
                    wordId: "different-word",
                },
                WORDLE_CONTENT,
                "light",
            ),
        ).toThrow(
            "Wordle content does not match the selected word.",
        );
    });

    it("rejects unavailable target phonemes", () => {
        expect(() =>
            buildStandaloneWordleHtml(
                WORDLE_CONFIG,
                {
                    ...WORDLE_CONTENT,
                    phonemes: [],
                },
                "light",
            ),
        ).toThrow(
            'Wordle target uses unknown phoneme "ipa-hostile".',
        );
    });

    it("injects supplied content instead of static banks", () => {
        const wordleHtml =
            buildStandaloneWordleHtml(
                WORDLE_CONFIG,
                WORDLE_CONTENT,
                "light",
            );

        const wordSearchHtml =
            buildStandaloneWordSearchHtml(
                WORD_SEARCH_CONFIG,
                WORD_SEARCH_CONTENT,
                "light",
            );

        expect(wordleHtml).toContain(
            '"id":"database-target"',
        );

        expect(wordSearchHtml).toContain(
            '"id":"database-search-word"',
        );

        expect(wordleHtml).not.toContain(
            '"id":"theta"',
        );

        expect(wordSearchHtml).not.toContain(
            '"id":"theta"',
        );
    });

    it("embeds single-cell and shared-endpoint selection rules", () => {
        const html =
            buildStandaloneWordSearchHtml(
                WORD_SEARCH_CONFIG,
                WORD_SEARCH_CONTENT,
                "light",
            );

        const matcherStart = html.indexOf(
            "function findUnfoundPlacement",
        );

        const matcherEnd = html.indexOf(
            "function completePlacement",
        );

        expect(matcherStart)
            .toBeGreaterThanOrEqual(0);

        expect(matcherEnd)
            .toBeGreaterThan(matcherStart);

        const matcherSource = html.slice(
            matcherStart,
            matcherEnd,
        );

        // Shared endpoints must resolve an unfound word first.
        expect(matcherSource).toContain(
            "!foundWordIds.has(placement.wordId)",
        );

        expect(matcherSource).toContain(
            "placementMatchesEndpoints",
        );

        // One-phoneme words complete without a second click.
        expect(html).toContain(
            "placement.coordinates.length === 1",
        );

        expect(html).toContain(
            "completePlacement(singleCellPlacement)",
        );

        expect(html).toContain(
            "completePlacement(matchingPlacement)",
        );

        expect(html).toContain(
            "const alreadyFound =",
        );
    });

    it("guards Word Search hints when disabled", () => {
        const html =
            buildStandaloneWordSearchHtml(
                WORD_SEARCH_CONFIG,
                WORD_SEARCH_CONTENT,
                "light",
            );

        // English remains serialized for learner completion messages.
        expect(html).toContain(
            '"hintsEnabled":false',
        );

        expect(html).toMatch(
            /if \(data\.hintsEnabled\) \{\s*button\.title\s*=/,
        );

        expect(html).toMatch(
            /if \(data\.hintsEnabled\) \{\s*const english\s*=/,
        );

        expect(
            countOccurrences(
                html,
                "button.title",
            ),
        ).toBe(1);

        expect(html).not.toContain(
            "innerHTML",
        );

        expect(html).toContain(
            "button.textContent",
        );

        expect(html).toContain(
            "english.textContent = word.english",
        );
    });
});