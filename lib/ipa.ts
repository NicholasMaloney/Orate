// Individual phoneme symbols are stored without slash delimiters.
export function normaliseIpaSymbol(value: string): string {
    return value
        .trim()
        .replace(/^\/+/, "")
        .replace(/\/+$/, "")
        .trim()
        .normalize("NFC");
}

// Complete transcriptions are stored with exactly one slash pair.
export function normaliseIpaTranscription(value: string): string {
    const transcription = normaliseIpaSymbol(value);

    return transcription.length > 0
        ? `/${transcription}/`
        : "";
}