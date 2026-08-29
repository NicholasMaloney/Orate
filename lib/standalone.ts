/**
 * Standalone activity document builders.
 *
 * Translates the teacher's WordleConfig into one complete HTML document
 * containing its own markup, styles, data, and plain JavaScript.
 */
import { DIFFICULTY_DETAILS } from "@/lib/difficulty";
import { PHONEMES } from "@/lib/phoneme-definitions";
import { getWordleWord, WORD_SEARCH_WORDS } from "@/lib/phonemes";
import type { ResolvedTheme, WordleConfig, WordSearchConfig } from "@/lib/types";
import { generateWordSearch } from "@/lib/word-search";

function serializeForScript(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function documentShell({
  title,
  theme,
  body,
  script,
  gameStyles,
}: {
  title: string;
  theme: ResolvedTheme;
  body: string;
  script: string;
  gameStyles: string;
}): string {
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="${theme}">
  <title>${title}</title>
  <style>
    :root {
      --background: #f3f7fb;
      --surface: #fcfdff;
      --soft: #e4edf6;

      --text: #17233a;
      --muted: #53657a;

      --border: #c6d5e4;
      --control-border: #8195aa;

      --accent: #245d8a;

      --action: #245d8a;
      --action-hover: #1c496d;
      --action-text: #ffffff;

      --focus: #245d8a;

      --correct: #08734f;
      --present: #9a5b00;
      --absent: #65767b;
    }

    [data-theme="dark"] {
      --background: #111c2e;
      --surface: #1b2a41;
      --soft: #263a56;

      --text: #f4f7fb;
      --muted: #b9c7d8;

      --border: #405873;
      --control-border: #6b85a2;

      --accent: #8cc4ea;

      --action: #317aab;
      --action-hover: #285f88;
      --action-text: #ffffff;

      --focus: #8cc4ea;

      --correct: #64d7b0;
      --present: #f0bd61;
      --absent: #a6b4b8;
    }

    * { box-sizing: border-box; }

    html {
      min-height: 100%;
      background: var(--background);
    }

    body {
      min-height: 100vh;
      margin: 0;
      background: var(--background);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }

    button { font: inherit; }

    button:focus-visible,
    .skip-link:focus {
      outline: 3px solid var(--focus);
      outline-offset: 3px;
    }

    .skip-link {
      position: fixed;
      top: -5rem;
      left: 1rem;
      z-index: 10;
      padding: 0.65rem 1rem;
      background: var(--text);
      color: var(--surface);
      font-weight: 700;
    }

    .skip-link:focus { top: 1rem; }

    .app {
      width: min(100% - 2rem, 70rem);
      margin: 0 auto;
      padding: 1.5rem 0 2.5rem;
    }

    .brand {
      margin: 0 0 1rem;
      color: var(--accent);
      font-size: 1.1rem;
      font-weight: 800;
    }

    .panel {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      background: var(--surface);
    }

    .panel-header {
      padding: clamp(1.2rem, 4vw, 2rem);
      border-bottom: 1px solid var(--border);
      background: var(--soft);
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      color: var(--accent);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.8rem, 5vw, 2.8rem);
      line-height: 1.1;
    }

    .lede {
      max-width: 48rem;
      margin: 0.7rem 0 0;
      color: var(--muted);
    }

    .game { padding: clamp(1rem, 4vw, 2rem); }

    .status-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .status {
      margin: 0;
      color: var(--muted);
      font-weight: 700;
    }

    .restart {
      border: 1px solid var(--control-border);
      border-radius: 0.4rem;
      padding: 0.55rem 0.8rem;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-weight: 700;
    }

    .restart:hover {
      border-color: var(--accent);
      background: var(--soft);
    }

    .message {
      min-height: 3rem;
      margin: 1rem 0;
      border-left: 4px solid var(--accent);
      padding: 0.7rem 0.85rem;
      background: var(--soft);
      font-weight: 700;
    }

    .message[data-tone="success"] {
      border-color: var(--correct);
    }

    .message[data-tone="warning"] {
      border-color: var(--present);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .footer-note {
      margin: 1rem 0 0;
      color: var(--muted);
      font-size: 0.82rem;
      text-align: center;
    }

    ${gameStyles}

    @media (max-width: 36rem) {
      .app {
        width: min(100% - 1rem, 70rem);
        padding-top: 0.5rem;
      }

      .panel { border-radius: 0.5rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
      }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#activity">Skip to activity</a>

  <main class="app" id="activity">
    <p class="brand"></p>
    ${body}
  </main>

  <script>
    "use strict";
    ${script}
  </script>
</body>
</html>`;
}

const WORDLE_STYLES = `
  .board {
    display: grid;
    gap: 0.4rem;
    width: min(100%, 30rem);
    margin: 0 auto;
  }

  .guess-row {
    display: grid;
    grid-template-columns:
      repeat(var(--phoneme-count), minmax(0, 4.5rem));
    justify-content: center;
    gap: 0.4rem;
  }

  .tile {
    display: grid;
    min-height: clamp(3.4rem, 12vw, 4.5rem);
    place-items: center;
    border: 2px solid var(--border);
    border-radius: 0.4rem;
    background: var(--surface);
    font-size: clamp(1.3rem, 5vw, 1.9rem);
    font-weight: 800;
  }

  .tile small {
    font-size: 0.7rem;
    line-height: 1;
  }
 
  .tile[data-state="correct"] {
    border-color: #166534;
    background: #15803d;
    color: #ffffff;
  }

  .tile[data-state="present"] {
    border-color: #b45309;
    background: #fbbf24;
    color: #422006;
  }

  .tile[data-state="absent"] {
    border-color: #475569;
    background: #64748b;
    color: #ffffff;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1rem;
    margin: 1rem 0;
    color: var(--muted);
    font-size: 0.8rem;
  }

  .keyboard {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    max-width: 44rem;
    margin: 1rem auto 0;
  }

  .key {
    position: relative;
    display: grid;
    min-width: 3.4rem;
    min-height: 3.3rem;
    place-items: center;
    border: 1px solid var(--control-border);
    border-radius: 0.4rem;
    padding: 0.3rem 0.5rem;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
  }

  .key:hover {
    border-color: var(--accent);
    background: var(--soft);
  }

  .key .ipa {
    font-weight: 800;
    line-height: 1;
  }

  .key .letters {
    color: var(--muted);
    font-size: 0.65rem;
  }

  .key.action {
    min-width: 5.5rem;
    border-color: var(--action);
    background: var(--action);
    color: var(--action-text);
    font-weight: 800;
  }

  .key.action:hover {
    border-color: var(--action-hover);
    background: var(--action-hover);
  }

  .key.secondary {
    background: var(--soft);
    color: var(--text);
  }

  .key[data-hint]::after {
    position: absolute;
    bottom: calc(100% + 0.45rem);
    left: 50%;
    z-index: 5;
    display: none;
    width: max-content;
    max-width: 13rem;
    padding: 0.4rem 0.55rem;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--surface);
    content: attr(data-hint);
    font-size: 0.72rem;
  }

  .key[data-hint]:not([data-tooltip-hidden="true"]):hover::after,
  .key[data-hint]:not([data-tooltip-hidden="true"]):focus-visible::after {
    display: block;
  }

  .hint-note {
    margin: 1rem auto 0;
    color: var(--muted);
    font-size: 0.85rem;
    text-align: center;
  }
`;

export function buildStandaloneWordleHtml(config: WordleConfig, theme: ResolvedTheme,): string {
  const selectedWord = getWordleWord(config.wordId);
  const maximumAttempts =
    DIFFICULTY_DETAILS[config.difficulty].attempts;
  const phonemeCount = selectedWord.phonemeIds.length;

  const data = {
    selectedWord,
    maximumAttempts,
    phonemeCount,
    hintsEnabled: config.hintsEnabled,
    phonemes: PHONEMES,
  };

  const initialStatusMessage =
    `Choose ${phonemeCount} phonemes to create a guess.`;

  const body = `
    <section class="panel" aria-labelledby="activity-title">
      <header class="panel-header">
        <p class="eyebrow">Phoneme Wordle</p>
        <h1 id="activity-title">Build the phoneme word</h1>

        <p class="lede">
          Choose ${phonemeCount} phonemes and submit your guess.
          ✓ means correct place, ↔ means a different place,
          and × means not in the word.
        </p>
      </header>

      <div class="game">
        <div class="status-row">
          <p class="status" id="attempt-status">
            Attempt 1 of ${maximumAttempts}
          </p>

          <button class="restart" id="restart" type="button">
            Restart
          </button>
        </div>

        <div
          class="board"
          id="board"
          role="grid"
          aria-label="Wordle board with ${maximumAttempts} attempts"
          aria-rowcount="${maximumAttempts}"
          aria-colcount="${phonemeCount}"
          style="--phoneme-count: ${phonemeCount}"
        ></div>

        <div class="legend" aria-label="Tile result legend">
          <span>✓ Correct place</span>
          <span>↔ Different place</span>
          <span>× Not in word</span>
        </div>

        <p class="message" id="status-message">
          ${initialStatusMessage}
        </p>

        <div
          class="keyboard"
          id="keyboard"
          role="group"
          aria-label="Phoneme keyboard"
        ></div>

        ${config.hintsEnabled
      ? `<p class="hint-note">
                Hover over or focus a phoneme key for a spelling hint.
                Press Escape to dismiss a hint.
               </p>`
      : ""
    }

        <div
          class="sr-only"
          id="announcement"
          aria-live="polite"
        ></div>
      </div>
    </section>`;

  const script = `
    const data = ${serializeForScript(data)};
    const phonemeById = new Map(
      data.phonemes.map((phoneme) => [phoneme.id, phoneme])
    );
    const targetPhonemeIds = data.selectedWord.phonemeIds;

    let submittedGuesses = [];
    let currentGuess = [];
    let gameIsOver = false;

    const board = document.getElementById("board");
    const keyboard = document.getElementById("keyboard");
    const statusMessageElement =
      document.getElementById("status-message");
    const attemptStatus =
      document.getElementById("attempt-status");
    const announcement =
      document.getElementById("announcement");

    function scoreGuess(guess, targetPhonemeIds) {
      if (guess.length !== targetPhonemeIds.length) {
        throw new Error(
          "A Wordle guess must contain the same number of phonemes as the target."
        );
      }

      const results = Array.from(
        { length: guess.length },
        () => "absent"
      );

      const remainingTargetPhonemeIds =
        targetPhonemeIds.slice();

      guess.forEach((phonemeId, position) => {
        if (phonemeId === targetPhonemeIds[position]) {
          results[position] = "correct";
          remainingTargetPhonemeIds[position] = null;
        }
      });

      guess.forEach((phonemeId, position) => {
        if (results[position] === "correct") {
          return;
        }

        const matchingTargetPhonemePosition =
          remainingTargetPhonemeIds.indexOf(phonemeId);

        if (matchingTargetPhonemePosition !== -1) {
          results[position] = "present";
          remainingTargetPhonemeIds[
            matchingTargetPhonemePosition
          ] = null;
        }
      });

      return results;
    }

    function setStatusMessage(text, tone) {
      statusMessageElement.textContent = text;
      statusMessageElement.dataset.tone = tone || "";
      announcement.textContent = text;
    }

    function renderBoard() {
      board.innerHTML = "";

      for (
        let rowIndex = 0;
        rowIndex < data.maximumAttempts;
        rowIndex += 1
      ) {
        const row = document.createElement("div");
        row.className = "guess-row";
        row.setAttribute("role", "row");
        row.setAttribute(
          "aria-rowindex",
          String(rowIndex + 1)
        );

        const submittedGuess =
          submittedGuesses[rowIndex];

        const isCurrentRow =
          rowIndex === submittedGuesses.length &&
          !gameIsOver;

        const guessForRow =
          submittedGuess ??
          (isCurrentRow ? currentGuess : []);

        const rowScore =
          submittedGuess === undefined
            ? undefined
            : scoreGuess(
                submittedGuess,
                targetPhonemeIds
              );

        for (
          let columnIndex = 0;
          columnIndex < data.phonemeCount;
          columnIndex += 1
        ) {
          const tile = document.createElement("div");
          tile.className = "tile";
          tile.setAttribute("role", "gridcell");
          tile.setAttribute(
            "aria-colindex",
            String(columnIndex + 1)
          );

          const phonemeId =
            guessForRow[columnIndex];

          const guessState =
            rowScore?.[columnIndex];

          if (phonemeId) {
            const phoneme =
              phonemeById.get(phonemeId);

            if (!phoneme) {
              throw new Error(
                "Unknown phoneme: " + phonemeId
              );
            }

            const stateLabels = {
              correct:
                "correct phoneme in the correct position",
              present:
                "phoneme appears in another position",
              absent:
                "phoneme does not appear in the word",
            };

            const stateMarks = {
              correct: "✓",
              present: "↔",
              absent: "×",
            };

            tile.innerHTML =
              "<span>/" +
              phoneme.ipaSymbol +
              "/</span>" +
              (
                guessState
                  ? '<small aria-hidden="true">' +
                    stateMarks[guessState] +
                    "</small>"
                  : ""
              );

            const resultDescription =
              guessState
                ? ", " + stateLabels[guessState]
                : "";

            tile.setAttribute(
              "aria-label",
              "Attempt " +
                (rowIndex + 1) +
                ", position " +
                (columnIndex + 1) +
                ", " +
                phoneme.spokenName +
                " sound" +
                resultDescription
            );
          } else {
            tile.setAttribute(
              "aria-label",
              "Attempt " +
                (rowIndex + 1) +
                ", position " +
                (columnIndex + 1) +
                ", empty"
            );
          }

          if (guessState) {
            tile.dataset.state = guessState;
          }

          row.appendChild(tile);
        }

        board.appendChild(row);
      }
    }

    function renderKeyboard() {
      keyboard.innerHTML = "";

      data.phonemes.forEach((phoneme) => {
        const button =
          document.createElement("button");

        button.type = "button";
        button.className = "key";
        button.setAttribute(
          "aria-label",
          "Add " + phoneme.spokenName + " sound"
        );

        let letters = "";
        let help = "";

        if (data.hintsEnabled) {
          const hint =
            phoneme.grapheme +
            " as in " +
            phoneme.exampleWord;

          const tooltipId =
            "phoneme-help-" + phoneme.id;

          button.title = hint;
          button.dataset.hint = hint;
          button.setAttribute(
            "aria-describedby",
            tooltipId
          );

          letters =
            '<span class="letters">' +
            phoneme.grapheme +
            "</span>";

          help =
            '<span class="sr-only" role="tooltip" id="' +
            tooltipId +
            '">' +
            hint +
            "</span>";

          button.addEventListener(
            "mouseenter",
            () => delete button.dataset.tooltipHidden
          );

          button.addEventListener(
            "focus",
            () => delete button.dataset.tooltipHidden
          );

          button.addEventListener(
            "keydown",
            (event) => {
              if (event.key === "Escape") {
                button.dataset.tooltipHidden = "true";
              }
            }
          );
        }

        button.innerHTML =
          '<span class="ipa">/' +
          phoneme.ipaSymbol +
          "/</span>" +
          letters +
          help;

        button.addEventListener(
          "click",
          () => handlePhonemeInput(phoneme.id)
        );

        keyboard.appendChild(button);
      });

      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className =
        "key action secondary";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener(
        "click",
        handleDelete
      );

      keyboard.appendChild(deleteButton);

      const submitButton =
        document.createElement("button");

      submitButton.type = "button";
      submitButton.className = "key action";
      submitButton.textContent = "Submit guess";
      submitButton.addEventListener(
        "click",
        handleSubmit
      );

      keyboard.appendChild(submitButton);
    }

    function handlePhonemeInput(phonemeId) {
      if (
        gameIsOver ||
        currentGuess.length >= data.phonemeCount
      ) {
        return;
      }

      currentGuess.push(phonemeId);
      setStatusMessage("");
      renderBoard();

      const phoneme = phonemeById.get(phonemeId);

      if (phoneme) {
        announcement.textContent =
          "Added " +
          phoneme.spokenName +
          ". " +
          currentGuess.length +
          " of " +
          data.phonemeCount +
          " phonemes selected.";
      }
    }

    function handleDelete() {
      if (
        gameIsOver ||
        currentGuess.length === 0
      ) {
        return;
      }

      const removedPhonemeId =
        currentGuess.pop();

      setStatusMessage("");
      renderBoard();

      const removedPhoneme =
        phonemeById.get(removedPhonemeId);

      if (removedPhoneme) {
        announcement.textContent =
          "Removed " +
          removedPhoneme.spokenName +
          " sound.";
      }
    }

    function handleRestart() {
      submittedGuesses = [];
      currentGuess = [];
      gameIsOver = false;

      attemptStatus.textContent =
        "Attempt 1 of " + data.maximumAttempts;

      setStatusMessage(
        "Choose " +
          data.phonemeCount +
          " phonemes to create a guess."
      );

      renderBoard();
    }

    function handleSubmit() {
      if (gameIsOver) {
        return;
      }

      if (
        currentGuess.length !== data.phonemeCount
      ) {
        const remainingPhonemes =
          data.phonemeCount -
          currentGuess.length;

        setStatusMessage(
          "Choose " +
            remainingPhonemes +
            " more " +
            (
              remainingPhonemes === 1
                ? "phoneme"
                : "phonemes"
            ) +
            " before submitting.",
          "warning"
        );

        return;
      }

      const completedAttemptNumber =
        submittedGuesses.length + 1;

      const guessScore =
        scoreGuess(
          currentGuess,
          targetPhonemeIds
        );

      const isWinningGuess =
        guessScore.every(
          (state) => state === "correct"
        );

      submittedGuesses.push(
        currentGuess.slice()
      );

      currentGuess = [];

      const hasWon = isWinningGuess;
      const hasUsedAllAttempts =
        submittedGuesses.length >=
        data.maximumAttempts;

      gameIsOver =
        hasWon || hasUsedAllAttempts;

      if (hasWon) {
        setStatusMessage(
          "Correct! You identified " +
            data.selectedWord.ipa +
            " in " +
            completedAttemptNumber +
            " " +
            (
              completedAttemptNumber === 1
                ? "attempt"
                : "attempts"
            ) +
            ".",
          "success"
        );
      } else if (hasUsedAllAttempts) {
        setStatusMessage(
          "You have no attempts left. " +
            "The target was " +
            data.selectedWord.ipa +
            " — " +
            data.selectedWord.english +
            ".",
          "warning"
        );
      } else {
        setStatusMessage(
          "Guess " +
            completedAttemptNumber +
            " scored. Try again."
        );
      }

      attemptStatus.textContent =
        gameIsOver
          ? "Activity complete"
          : "Attempt " +
            (submittedGuesses.length + 1) +
            " of " +
            data.maximumAttempts;

      renderBoard();
    }

    document
      .getElementById("restart")
      .addEventListener(
        "click",
        handleRestart
      );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.target instanceof
          HTMLButtonElement
        ) {
          return;
        }

        if (event.key === "Backspace") {
          event.preventDefault();
          handleDelete();
        }

        if (event.key === "Enter") {
          event.preventDefault();
          handleSubmit();
        }
      }
    );

    renderBoard();
    renderKeyboard();
  `;

  return documentShell({
    title:
      `Orate Phoneme Wordle — ${selectedWord.english}`,
    theme,
    body,
    script,
    gameStyles: WORDLE_STYLES,
  });
}

// Word Search 
const WORD_SEARCH_STYLES = `
  .search-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 16rem);
    gap: 1.5rem;
    align-items: start;
  }

  .grid-wrap {
    min-width: 0;
    overflow-x: auto;
    padding: 0.2rem;
  }

  .search-grid {
    display: grid;
    grid-template-columns:
      repeat(var(--grid-size), minmax(2.2rem, 1fr));
    gap: 0.25rem;
    width: min(100%, 38rem);
    min-width: max-content;
    margin: 0 auto;
  }

  .search-cell {
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid var(--control-border);
    border-radius: 0.35rem;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    font-size: clamp(0.7rem, 2vw, 1rem);
    font-weight: 800;
  }

  .search-cell:hover {
    border-color: var(--accent);
    background: var(--soft);
  }

  .search-cell[data-selected="true"] {
    border: 2px solid var(--accent);
    background: var(--soft);
  }

  .search-cell[data-found="true"] {
    border-color: var(--correct);
    background: var(--correct);
    color: var(--surface);
  }

  .word-bank {
    border: 1px solid var(--border);
    border-radius: 0.6rem;
    padding: 1rem;
    background: var(--soft);
  }

  .word-bank h2 {
    margin: 0;
    font-size: 1.15rem;
  }

  .word-bank p {
    margin: 0.35rem 0 0;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .word-list {
    display: grid;
    gap: 0.6rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .word-item {
    border: 1px solid var(--border);
    border-radius: 0.4rem;
    padding: 0.65rem;
    background: var(--surface);
  }

  .word-item strong,
  .word-item span {
    display: block;
  }

  .word-item .english {
    margin-top: 0.15rem;
    color: var(--muted);
    font-size: 0.8rem;
  }

  .word-item .found-label {
    margin-top: 0.25rem;
    color: var(--correct);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .word-item[data-found="true"] strong {
    text-decoration: line-through;
  }

  @media (max-width: 52rem) {
    .search-layout {
      grid-template-columns: 1fr;
    }

    .word-list {
      grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    }
  }
`;

export function buildStandaloneWordSearchHtml(
    config: WordSearchConfig,
    theme: ResolvedTheme,
): string {
    const puzzle = generateWordSearch(config);
    const gridSize = puzzle.grid.length;

    /**
     * These are the only data values needed by the browser activity.
     * serializeForScript converts this object into script-safe JSON.
     */
    const data = {
        puzzle,
        hintsEnabled: config.hintsEnabled,
        phonemes: PHONEMES,
        words: WORD_SEARCH_WORDS,
    };

    const body = `
    <section class="panel" aria-labelledby="activity-title">
      <header class="panel-header">
        <p class="eyebrow">Phoneme Word Search</p>
        <h1 id="activity-title">Find the hidden phoneme words</h1>

        <p class="lede">
          Select the first phoneme of a word, then select its final
          phoneme. Words may appear in either direction.
        </p>
      </header>

      <div class="game">
        <div class="status-row">
          <p class="status" id="progress">
            0 of ${WORD_SEARCH_WORDS.length} words found
          </p>

          <button class="restart" id="restart" type="button">
            Restart
          </button>
        </div>

        <p class="message" id="status-message">
          Choose the first phoneme of a word.
        </p>

        <div class="search-layout">
          <div class="grid-wrap">
            <div
              class="search-grid"
              id="search-grid"
              role="group"
              aria-label="${gridSize} by ${gridSize} interactive phoneme Word Search"
              style="--grid-size: ${gridSize}"
            ></div>
          </div>

          <aside class="word-bank" aria-labelledby="word-bank-title">
            <h2 id="word-bank-title">Words to find</h2>
            <p>Select one endpoint, then the other.</p>
            <ul class="word-list" id="word-list"></ul>
          </aside>
        </div>

        <div
          class="sr-only"
          id="announcement"
          aria-live="polite"
        ></div>
      </div>
    </section>`;

    const script = `
    const data = ${serializeForScript(data)};

    const phonemeById = new Map(
      data.phonemes.map(
        (phoneme) => [phoneme.id, phoneme]
      )
    );

    const wordById = new Map(
      data.words.map(
        (word) => [word.id, word]
      )
    );

    const foundWordIds = new Set();
    let selectionStart = null;

    const gridElement =
      document.getElementById("search-grid");

    const wordListElement =
      document.getElementById("word-list");

    const progressElement =
      document.getElementById("progress");

    const statusMessageElement =
      document.getElementById("status-message");

    const announcement =
      document.getElementById("announcement");

    function coordinatesAreEqual(first, second) {
      return (
        first.row === second.row &&
        first.column === second.column
      );
    }

    function placementMatchesEndpoints(
      placement,
      start,
      end
    ) {
      const firstCoordinate =
        placement.coordinates[0];

      const lastCoordinate =
        placement.coordinates[
          placement.coordinates.length - 1
        ];

      return (
        (
          coordinatesAreEqual(firstCoordinate, start) &&
          coordinatesAreEqual(lastCoordinate, end)
        ) ||
        (
          coordinatesAreEqual(firstCoordinate, end) &&
          coordinatesAreEqual(lastCoordinate, start)
        )
      );
    }

    function isFoundCoordinate(row, column) {
      return data.puzzle.placements.some(
        (placement) =>
          foundWordIds.has(placement.wordId) &&
          placement.coordinates.some(
            (coordinate) =>
              coordinate.row === row &&
              coordinate.column === column
          )
      );
    }

    function setStatusMessage(text, tone) {
      statusMessageElement.textContent = text;
      statusMessageElement.dataset.tone =
        tone || "";

      announcement.textContent = text;
    }

    function renderGrid() {
      gridElement.replaceChildren();

      data.puzzle.grid.forEach(
        (row, rowIndex) => {
          row.forEach(
            (phonemeId, columnIndex) => {
              const phoneme =
                phonemeById.get(phonemeId);

              if (!phoneme) {
                throw new Error(
                  "Unknown phoneme: " + phonemeId
                );
              }

              const coordinate = {
                row: rowIndex,
                column: columnIndex,
              };

              const isSelected =
                selectionStart !== null &&
                coordinatesAreEqual(
                  selectionStart,
                  coordinate
                );

              const isFound =
                isFoundCoordinate(
                  rowIndex,
                  columnIndex
                );

              const button =
                document.createElement("button");

              button.type = "button";
              button.className = "search-cell";
              button.textContent =
                "/" + phoneme.ipaSymbol + "/";

              button.dataset.selected =
                String(isSelected);

              button.dataset.found =
                String(isFound);

              button.setAttribute(
                "aria-pressed",
                String(isSelected)
              );

              button.setAttribute(
                "aria-label",
                phoneme.spokenName +
                  ", row " +
                  (rowIndex + 1) +
                  ", column " +
                  (columnIndex + 1) +
                  (
                    isFound
                      ? ", part of a found word"
                      : ""
                  )
              );

              button.title =
                phoneme.grapheme +
                " as in " +
                phoneme.exampleWord;

              button.addEventListener(
                "click",
                () => selectCell(coordinate)
              );

              gridElement.appendChild(button);
            }
          );
        }
      );
    }

    function renderWordList() {
      wordListElement.replaceChildren();

      data.words.forEach((word) => {
        const isFound =
          foundWordIds.has(word.id);

        const item =
          document.createElement("li");

        item.className = "word-item";
        item.dataset.found = String(isFound);

        item.setAttribute(
          "aria-label",
          word.ipa +
            (
              isFound
                ? ", found"
                : ", not found"
            )
        );

        const ipa =
          document.createElement("strong");

        ipa.textContent = word.ipa;
        item.appendChild(ipa);

        if (data.hintsEnabled) {
          const english =
            document.createElement("span");

          english.className = "english";
          english.textContent = word.english;
          item.appendChild(english);
        }

        if (isFound) {
          const foundLabel =
            document.createElement("span");

          foundLabel.className =
            "found-label";

          foundLabel.textContent = "Found";
          item.appendChild(foundLabel);
        }

        wordListElement.appendChild(item);
      });

      progressElement.textContent =
        foundWordIds.size +
        " of " +
        data.words.length +
        " words found";
    }

    function selectCell(coordinate) {
      if (selectionStart === null) {
        selectionStart = coordinate;

        setStatusMessage(
          "Start selected. Now choose the final phoneme."
        );

        renderGrid();
        return;
      }

      if (
        coordinatesAreEqual(
          selectionStart,
          coordinate
        )
      ) {
        selectionStart = null;

        setStatusMessage(
          "Selection cleared. Choose a new starting phoneme."
        );

        renderGrid();
        return;
      }

      const matchingPlacement =
        data.puzzle.placements.find(
          (placement) =>
            placementMatchesEndpoints(
              placement,
              selectionStart,
              coordinate
            )
        );

      selectionStart = null;

      if (!matchingPlacement) {
        setStatusMessage(
          "That line is not one of the target words. Try again.",
          "warning"
        );
      } else if (
        foundWordIds.has(
          matchingPlacement.wordId
        )
      ) {
        setStatusMessage(
          "You have already found that word. Choose another.",
          "warning"
        );
      } else {
        foundWordIds.add(
          matchingPlacement.wordId
        );

        const matchedWord =
          wordById.get(
            matchingPlacement.wordId
          );

        if (
          foundWordIds.size ===
          data.words.length
        ) {
          setStatusMessage(
            "Well done! You found every phoneme word.",
            "success"
          );
        } else if (matchedWord) {
          setStatusMessage(
            "Found " +
              matchedWord.ipa +
              (
                data.hintsEnabled
                  ? " - " + matchedWord.english
                  : ""
              ) +
              ".",
            "success"
          );
        } else {
          setStatusMessage(
            "Word found!",
            "success"
          );
        }
      }

      renderGrid();
      renderWordList();
    }

    function restartGame() {
      foundWordIds.clear();
      selectionStart = null;

      setStatusMessage(
        "Choose the first phoneme of a word."
      );

      renderGrid();
      renderWordList();
    }

    document
      .getElementById("restart")
      .addEventListener(
        "click",
        restartGame
      );

    renderGrid();
    renderWordList();
  `;

    return documentShell({
        title:
            `Orate Phoneme Word Search - ${config.difficulty}`,
        theme,
        body,
        script,
        gameStyles: WORD_SEARCH_STYLES,
    });
}