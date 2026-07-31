/**
 * Standalone activity document builders.
 *
 * Translates the teacher's WordleConfig into one complete HTML document
 * containing its own markup, styles, data, and plain JavaScript.
 */
import { DIFFICULTY_DETAILS } from "@/lib/difficulty";
import { PHONEMES } from "@/lib/phoneme-definitions";
import { getWordleWord } from "@/lib/phonemes";
import type { WordleConfig } from "@/lib/types";

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
    theme: "light" | "dark";
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
      --background: #f3f7f5;
      --surface: #ffffff;
      --soft: #e6f0ed;
      --text: #17343b;
      --muted: #536a70;
      --border: #b9cec8;
      --accent: #0b6b64;
      --focus: #a94f00;
      --correct: #08734f;
      --present: #9a5b00;
      --absent: #65767b;
    }

    [data-theme="dark"] {
      --background: #0d1c20;
      --surface: #142a30;
      --soft: #1c363d;
      --text: #f0faf7;
      --muted: #b8cbc6;
      --border: #456269;
      --accent: #72e3d1;
      --focus: #ffc857;
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
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      padding: 0.55rem 0.8rem;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-weight: 700;
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
    <p class="brand">Orate</p>
    ${body}
    <p class="footer-note">Standalone classroom activity · Works offline</p>
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
    border-color: var(--correct);
  }

  .tile[data-state="present"] {
    border-color: var(--present);
  }

  .tile[data-state="absent"] {
    border-color: var(--absent);
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
    border: 1px solid var(--border);
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
    background: var(--accent);
    color: var(--background);
    font-weight: 800;
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

export function buildStandaloneWordleHtml(config: WordleConfig): string {
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
      
        <h2 id="wordle-preview-heading" className="text-2xl font-semibold pl-8">
            Current Selected Word: ${selectedWord.english}
        </h2>

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
        theme: "light",
        body,
        script,
        gameStyles: WORDLE_STYLES,
    });
}