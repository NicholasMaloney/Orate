import { DIFFICULTY_DETAILS } from "@/lib/difficulty";
import { getWordleWord } from "@/lib/phonemes";
import type { WordleConfig } from "@/lib/types";

// accepts the Wordle config and builds a game board based on it 
interface WordleBoardProps {
    readonly config: WordleConfig;
}

// render an empty Wordle board using the current configuration 
    // the number of rows comes from the difficulty selected 
    // the number of columns comes from the selected word
export function WordleBoard({ config }: WordleBoardProps) {
    const selectWord = getWordleWord(config.wordId);
    const maximumAttempts = DIFFICULTY_DETAILS[config.difficulty].attempts;
    const phonemeCount = selectWord.phonemeIds.length;
    
    // this creates the empty game board
    const boardRows = Array.from(
        {length: maximumAttempts},
        () => Array.from({ length: phonemeCount }, () => null), 
    );

    return (
        <section
            className="mt-8 border-t border-slate-200 pt-6"
            aria-labelledby="wordle-board-heading"
        >
            <div className="text-center">
                <h3 id="wordle-board-heading" className="text-xl font-semibold">
                    Wordle Board
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                    {maximumAttempts} attempts · {phonemeCount} phonemes per guess
                </p>
            </div>

            <div
                role="grid"
                aria-label={`Wordle board woth ${maximumAttempts} attempts`}
                aria-rowcount={maximumAttempts}
                aria-colcount={phonemeCount}
                className="mt-6 space-y-2"
            >
                {boardRows.map((row, rowIndex) => ( // renders the rows 
                    <div
                        role="row"
                        aria-rowindex={rowIndex + 1}
                        key={`row-${rowIndex}`}
                        className="grid justify-center gap-2"
                        style={{
                            gridTemplateColumns: `repeat(${phonemeCount}, 3.5rem)`,
                        }}
                    >
                        {row.map((_, columnIndex) => ( // renders the cells 
                            <span
                                role="gridcell"
                                aria-colindex={columnIndex + 1}
                                aria-label={`Attempt ${rowIndex + 1}, phoneme ${columnIndex + 1}, empty`}
                                key={`cell-${rowIndex}-${columnIndex}`}
                                className="flex size-14 items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-900"                              
                            >
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}