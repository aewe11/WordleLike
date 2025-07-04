
// Expanded word list (add more as needed)
const WORDS = [
  "PLATE", "CRANE", "GHOST", "BRICK", "SWEET", "MOUSE", "APPLE", "BRAIN", "CHAIR", "DREAM", "EARTH", "FAITH", "GRAPE", "HEART", "INDEX", "JOKER", "KNIFE", "LEMON", "MAGIC", "NURSE", "OCEAN", "PIZZA", "QUEEN", "ROBOT", "SNAKE", "TIGER", "ULTRA", "VIRUS", "WATER", "XENON", "YOUTH", "ZEBRA", "BREAD", "CLOUD", "DRIVE", "EAGER", "FROST", "GLASS", "HONEY", "INPUT", "JELLY", "KNOCK", "LUNCH", "MUSIC", "NIGHT", "OPERA", "PRIZE", "QUICK", "RIVER", "SHINE", "TRUCK", "UNITY", "VIVID", "WORST", "YACHT", "ZONED"
];
// No longer needed: DICTIONARY set
const WORD = WORDS[Math.floor(Math.random() * WORDS.length)];
const MAX_GUESSES = 6;
let guesses = [];
let currentGuess = "";

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let row = 0; row < MAX_GUESSES; row++) {
    const rowEl = document.createElement("div");
    rowEl.className = "grid";
    const guess = guesses[row] || "";
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const letter = guess[col] || "";
      cell.textContent = letter;

      if (guesses[row]) {
        const correct = WORD[col];
        if (letter === correct) {
          cell.classList.add("green");
        } else if (WORD.includes(letter)) {
          cell.classList.add("yellow");
        } else {
          cell.classList.add("gray");
        }
      } else {
        // Only add click for empty cell in current row
        if (row === guesses.length && !letter) {
          cell.style.cursor = "pointer";
          cell.onclick = () => {
            showNativeKeyboard();
          };
        }
      }

      rowEl.appendChild(cell);
    }
    board.appendChild(rowEl);
  }
}

function handleKey(key) {
  if (guesses.length >= MAX_GUESSES) return;
  const status = document.getElementById("status");
  status.textContent = "";

  if (key === "ENTER") {
    if (currentGuess.length < 5) return;
    checkWordInDictionary(currentGuess)
      .then(isValid => {
        if (!isValid) {
          status.textContent = "Not in word list.";
          return;
        }
        guesses.push(currentGuess);
        if (currentGuess === WORD) {
          status.textContent = "🎉 You guessed it!";
        } else if (guesses.length === MAX_GUESSES) {
          status.textContent = `💀 Out of tries! The word was: ${WORD}`;
        }
        currentGuess = "";
        renderBoard();
      });
  } else if (key === "BACKSPACE") {
    currentGuess = currentGuess.slice(0, -1);
    renderBoard();
    updateCurrentRow();
  } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key;
    renderBoard();
    updateCurrentRow();
  }
}

// Caches results for common 5-letter words to reduce API calls
const wordCache = {};
const COMMON_WORDS = new Set([
  "ABOUT", "TOUCH", "AFTER", "AGAIN", "BELOW", "COULD", "EVERY", "FIRST", "FOUND", "GREAT", "HOUSE", "LARGE", "LEARN", "NEVER", "OTHER", "PLACE", "PLANT", "POINT", "RIGHT", "SMALL", "SOUND", "SPELL", "STILL", "STUDY", "THEIR", "THERE", "THESE", "THING", "THINK", "THREE", "WATER", "WHERE", "WHICH", "WORLD", "WOULD", "WRITE",
  "APPLE", "BRAIN", "CHAIR", "DREAM", "EARTH", "FAITH", "GRAPE", "HEART", "INDEX", "JOKER", "KNIFE", "LEMON", "MAGIC", "NURSE", "OCEAN", "PIZZA", "QUEEN", "ROBOT", "SNAKE", "TIGER", "ULTRA", "VIRUS", "XENON", "YOUTH", "ZEBRA", "BREAD", "CLOUD", "DRIVE", "EAGER", "FROST", "GLASS", "HONEY", "INPUT", "JELLY", "KNOCK", "LUNCH", "MUSIC", "NIGHT", "OPERA", "PRIZE", "QUICK", "RIVER", "SHINE", "TRUCK", "UNITY", "VIVID", "WORST", "YACHT", "ZONED",
  "ALONE", "ANGEL", "BASIC", "CANDY", "DELTA", "ENEMY", "FANCY", "GIANT", "HUMAN", "IDEAL", "JUDGE", "KINGS", "LAYER", "MIGHT", "NOBLE", "OPENS", "PAINT", "QUIET", "RANGE", "SHARE", "TEACH", "URBAN", "VOTER", "WORRY", "YIELD", "ZESTY",
  "SMILE", "BRAVE", "CLEAN", "CLOSE", "COVER", "DAILY", "ENJOY", "FRESH", "GRAND", "HAPPY", "LEMON", "MIGHT", "NORTH", "OFFER", "PAPER", "QUIET", "RAISE", "SCALE", "TEACH", "UNION", "VISIT", "WORTH", "YOUNG", "ZEBRA"
]);

function checkWordInDictionary(word) {
  word = word.toUpperCase();
  if (wordCache[word] !== undefined) {
    return Promise.resolve(wordCache[word]);
  }
  if (COMMON_WORDS.has(word)) {
    wordCache[word] = true;
    return Promise.resolve(true);
  }

  // Special case: If the word is in the original WORDS list, accept it instantly (since it's a possible answer)
  if (WORDS.includes(word)) {
    wordCache[word] = true;
    return Promise.resolve(true);
  }
  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`)
    .then(res => {
      if (!res.ok) {
        wordCache[word] = false;
        return false;
      }
      return res.json();
    })
    .then(data => {
      const valid = Array.isArray(data);
      wordCache[word] = valid;
      return valid;
    })
    .catch(() => {
      wordCache[word] = false;
      return false;
    });
}

function updateCurrentRow() {
  const board = document.getElementById("board");
  const row = board.children[guesses.length];
  if (!row) return;
  for (let i = 0; i < 5; i++) {
    row.children[i].textContent = currentGuess[i] || "";
  }
}

function renderKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  // Standard QWERTY layout
  const rows = [
    [..."QWERTYUIOP"],
    [..."ASDFGHJKL"],
    [..."ZXCVBNM"]
  ];
  rows.forEach((row, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";
    // Add left spacer for third row
    if (idx === 2) {
      const spacer = document.createElement("div");
      spacer.style.width = "32px";
      rowDiv.appendChild(spacer);
    }
    row.forEach(k => {
      const btn = document.createElement("button");
      btn.textContent = k;
      btn.className = "key";
      btn.onclick = () => handleKey(k);
      rowDiv.appendChild(btn);
    });
    // Add right spacer for third row
    if (idx === 2) {
      const spacer = document.createElement("div");
      spacer.style.width = "32px";
      rowDiv.appendChild(spacer);
    }
    keyboard.appendChild(rowDiv);
  });
  // Add Enter and Backspace below as wide buttons
  const controlRow = document.createElement("div");
  controlRow.className = "keyboard-row";
  const enterBtn = document.createElement("button");
  enterBtn.textContent = "ENTER";
  enterBtn.className = "key big";
  enterBtn.onclick = () => handleKey("ENTER");
  controlRow.appendChild(enterBtn);
  const backBtn = document.createElement("button");
  backBtn.textContent = "⌫";
  backBtn.className = "key big";
  backBtn.onclick = () => handleKey("BACKSPACE");
  controlRow.appendChild(backBtn);
  keyboard.appendChild(controlRow);
}

// Listen for real keyboard
document.addEventListener("keydown", e => {
  if (e.key === "Enter") handleKey("ENTER");
  else if (e.key === "Backspace") handleKey("BACKSPACE");
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});


// Add replay button
function addReplayButton() {
  let btn = document.getElementById("replay-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "replay-btn";
    btn.textContent = "Replay";
    btn.className = "key big";
    btn.style.marginTop = "1rem";
    btn.onclick = replayGame;
    document.body.appendChild(btn);
  }
}

function replayGame() {
  // Pick a new word
  window.location.reload();
}

renderBoard();
renderKeyboard();
addReplayButton();
