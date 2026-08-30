// Public word-list summary returned by the collection API.
export interface WordListSummary {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly wordCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
}