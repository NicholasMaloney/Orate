"use client"

import { useRef } from "react";
import type { PhonemeTokenDraft, } from "@/features/library/types";

interface PhonemeTokenEditorProps {
    readonly tokens: readonly PhonemeTokenDraft[];
    readonly disabled: boolean;
    readonly onChange: (tokens: readonly PhonemeTokenDraft[]) => void;
}

type EditablePhonemeField = Exclude<keyof PhonemeTokenDraft, "key">;

const TOKEN_FIELDS: readonly {
    readonly name: EditablePhonemeField;
    readonly label: string;
    readonly placeholder: string;
    readonly maxLength: number;
}[] = [
    {
        name: "ipaSymbol",
        label: "IPA symbol",
        placeholder: "tʃ",
        maxLength: 20,
    },
    {
        name: "grapheme",
        label: "Written letters",
        placeholder: "ch",
        maxLength: 30,
    },
    {
        name: "spokenName",
        label: "Spoken name",
        placeholder: "ch sound",
        maxLength: 100,
    },
    {
        name: "exampleWord",
        label: "Example word",
        placeholder: "chin",
        maxLength: 100,
    },
];

function createEmptyToken(key: string): PhonemeTokenDraft {
    return {
        key,
        ipaSymbol: "",
        grapheme: "",
        exampleWord: "",
        spokenName: "",
    };
}

export function PhonemeTokenEditor({
    tokens,
    disabled,
    onChange,
}: PhonemeTokenEditorProps) {
    const nextTokenNumber = useRef(tokens.length + 1);

    // This updates one field without changing the order of the tokens.
    function updateToken(
        index: number,
        field: EditablePhonemeField,
        value: string,
    ) {
        onChange(tokens.map((token, tokenIndex) => (
            tokenIndex === index
                ? {
                    ...token,
                    [field]: value,
                }
                : token
        )));
    }

    // This adds a new empty token to the end of the spoken sequence.
    function addToken() {
        const key = `phoneme-token-${nextTokenNumber.current}`;

        nextTokenNumber.current += 1;

        onChange([
            ...tokens,
            createEmptyToken(key),
        ]);
    }

    // This moves a token while preserving the data entered into it.
    function moveToken(
        index: number,
        direction: -1 | 1,
    ) {
        const destination = index + direction;

        if (
            destination < 0
            || destination >= tokens.length
        ) {
            return;
        }

        const reorderedTokens = [...tokens];

        [
            reorderedTokens[index],
            reorderedTokens[destination],
        ] = [
            reorderedTokens[destination],
            reorderedTokens[index],
        ];

        onChange(reorderedTokens);
    }

    // A word must always retain at least one phoneme token.
    function removeToken(index: number) {
        if (tokens.length === 1) {
            return;
        }

        onChange(tokens.filter((
            _token,
            tokenIndex,
        ) => tokenIndex !== index));
    }

    return (
        <fieldset
            className="space-y-4"
            disabled={disabled}
        >
            <div>
                <legend className="text-base font-semibold">
                    Ordered phonemes
                </legend>

                <p className="mt-1 text-sm text-(--muted-foreground)">
                    Add one token for each sound, then arrange the
                    tokens in the order they are spoken.
                </p>
            </div>

            <div className="space-y-4">
                {tokens.map((token, index) => (
                    <section
                        className="rounded-xl border border-(--border) bg-background p-4"
                        key={token.key}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="font-semibold">
                                Phoneme {index + 1}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="mt-4 rounded-lg bg-(--action) px-5 py-3 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                    disabled={index === 0}
                                    onClick={() => moveToken(index, -1)}
                                    type="button"
                                >
                                    Move up
                                </button>

                                <button
                                    className="mt-4 rounded-lg bg-(--action) px-5 py-3 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                    disabled={index === tokens.length - 1}
                                    onClick={() => moveToken(index, 1)}
                                    type="button"
                                >
                                    Move down
                                </button>

                                <button
                                    className="mt-4 rounded-lg bg-(--action) px-5 py-3 font-semibold text-(--action-text) transition-colors hover:bg-(--action-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                                    disabled={tokens.length === 1}
                                    onClick={() => removeToken(index)}
                                    type="button"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {TOKEN_FIELDS.map((field) => {
                                const inputId = `${token.key}-${field.name}`;

                                return (
                                    <label
                                        className="grid gap-2 text-sm font-medium"
                                        htmlFor={inputId}
                                        key={field.name}
                                    >
                                        {field.label}

                                        <input
                                            className="text-input"
                                            id={inputId}
                                            maxLength={field.maxLength}
                                            onChange={(event) => updateToken(
                                                index,
                                                field.name,
                                                event.target.value,
                                            )}
                                            placeholder={field.placeholder}
                                            required
                                            value={token[field.name]}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            <button
                className="secondary-button"
                onClick={addToken}
                type="button"
            >
                Add phoneme
            </button>
        </fieldset>
    );
}