const levels = {
  easy: { rows: 5, cols: 7 },
  medium: { rows: 5, cols: 10 },
  hard: { rows: 10, cols: 10 }
};

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const shuffleBtn = document.getElementById('shuffle');
const resetBtn = document.getElementById('reset');

const audio = {
  ctx: null,
  started: false,
  master: null,
  bgmId: null,
  bgmStep: 0,
  ensure() {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.12;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(frequency, duration, type = 'sine', volume = 0.05, delay = 0) {
    if (!this.ctx || !this.master) return;
    const startAt = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(gain);
    gain.connect(this.master);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  },
  click() {
    this.ensure();
    this.tone(440, 0.08, 'square', 0.04);
    this.tone(620, 0.06, 'triangle', 0.03, 0.04);
  },
  lock() {
    this.ensure();
    this.tone(330, 0.12, 'triangle', 0.06);
    this.tone(520, 0.12, 'triangle', 0.05, 0.08);
  },
  startBgm() {
    if (this.bgmId) return;
    this.ensure();
    const pattern = [196, 220, 247, 294, 220, 196, 174, 147];
    this.bgmId = setInterval(() => {
      const freq = pattern[this.bgmStep % pattern.length];
      this.tone(freq, 0.18, 'triangle', 0.026);
      if (this.bgmStep % 2 === 0) {
        this.tone(freq / 2, 0.24, 'sine', 0.018);
      }
      this.bgmStep += 1;
    }, 260);
  },
  activate() {
    this.ensure();
    if (!this.started) {
      this.started = true;
      this.startBgm();
    }
  }
};

const state = {
  currentLevel: 'easy',
  pieces: [],
  selectedPiece: null,
  moveCount: 0,
  secondsElapsed: 0,
  timerId: null,
  solved: false
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateHUD() {
  movesEl.textContent = String(state.moveCount);
  timerEl.textContent = formatTime(state.secondsElapsed);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function startTimer() {
  clearInterval(state.timerId);
  state.secondsElapsed = 0;
  updateHUD();

  state.timerId = setInterval(() => {
    state.secondsElapsed += 1;
    updateHUD();
  }, 1000);
}

function getCellSize() {
  const { rows, cols } = levels[state.currentLevel];
  return {
    width: board.clientWidth / cols,
    height: board.clientHeight / rows
  };
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomEdgeType() {
  return Math.random() < 0.5 ? 'tab' : 'blank';
}

function buildPieceClipPath(width, height, edges) {
  const depth = Math.min(width, height) * 0.22;
  const points = [];

  points.push([0, 0]);
  if (edges.top === 'tab') {
    points.push(
      [width * 0.18, 0],
      [width * 0.28, -depth],
      [width * 0.38, 0],
      [width * 0.62, 0],
      [width * 0.72, -depth],
      [width * 0.82, 0]
    );
  }
  points.push([width, 0]);

  if (edges.right === 'tab') {
    points.push(
      [width, height * 0.18],
      [width + depth, height * 0.28],
      [width, height * 0.38],
      [width, height * 0.62],
      [width + depth, height * 0.72],
      [width, height * 0.82]
    );
  }
  points.push([width, height]);

  if (edges.bottom === 'tab') {
    points.push(
      [width * 0.82, height],
      [width * 0.72, height + depth],
      [width * 0.62, height],
      [width * 0.38, height],
      [width * 0.28, height + depth],
      [width * 0.18, height]
    );
  }
  points.push([0, height]);

  if (edges.left === 'tab') {
    points.push(
      [0, height * 0.82],
      [-depth, height * 0.72],
      [0, height * 0.62],
      [0, height * 0.38],
      [-depth, height * 0.28],
      [0, height * 0.18]
    );
  }
  points.push([0, 0]);

  const path = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return `polygon(${path})`;
}

function buildPuzzle() {
  const { rows, cols } = levels[state.currentLevel];
  const cell = getCellSize();
  board.innerHTML = '';
  state.pieces = [];

  const order = shuffleArray(Array.from({ length: rows * cols }, (_, index) => index));

  order.forEach((targetIndex, index) => {
    const row = Math.floor(targetIndex / cols);
    const col = targetIndex % cols;

    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.dataset.row = String(row);
    piece.dataset.col = String(col);
    piece.dataset.originIndex = String(targetIndex);
    piece.locked = false;

    const edges = {
      top: randomEdgeType(),
      right: randomEdgeType(),
      bottom: randomEdgeType(),
      left: randomEdgeType()
    };

    piece.edges = edges;
    piece.style.width = `${cell.width}px`;
    piece.style.height = `${cell.height}px`;
    piece.style.backgroundImage = "url('./car.avif')";
    piece.style.backgroundSize = `${board.clientWidth}px ${board.clientHeight}px`;
    piece.style.backgroundPosition = `${-col * cell.width}px ${-row * cell.height}px`;
    piece.style.clipPath = buildPieceClipPath(cell.width, cell.height, edges);

    piece.targetX = col * cell.width;
    piece.targetY = row * cell.height;
    piece.currentX = 0;
    piece.currentY = 0;

    const offsetX = 30 + (index % 7) * 120 + Math.random() * 30;
    const offsetY = 30 + Math.floor(index / 7) * 120 + Math.random() * 30;

    piece.style.left = `${offsetX}px`;
    piece.style.top = `${offsetY}px`;
    piece.style.position = 'absolute';
    piece.style.zIndex = String(index + 1);

    board.appendChild(piece);
    state.pieces.push(piece);
  });

  setStatus('Drag pieces into place to rebuild the car.');
}

function getTargetPosition(piece) {
  const row = Number(piece.dataset.row);
  const col = Number(piece.dataset.col);
  const cell = getCellSize();

  return {
    x: col * cell.width,
    y: row * cell.height
  };
}

function isNearTarget(piece) {
  const target = getTargetPosition(piece);
  const tolerance = Math.min(getCellSize().width, getCellSize().height) * 0.38;
  return Math.abs(piece.currentX - target.x) <= tolerance && Math.abs(piece.currentY - target.y) <= tolerance;
}

function checkSolved() {
  const solvedCount = state.pieces.filter((piece) => {
    if (piece.locked) return true;
    return isNearTarget(piece);
  }).length;

  if (solvedCount === state.pieces.length) {
    state.solved = true;
    clearInterval(state.timerId);
    setStatus(`You solved the ${state.currentLevel} puzzle in ${formatTime(state.secondsElapsed)} and ${state.moveCount} moves!`);

    state.pieces.forEach((piece) => {
      const target = getTargetPosition(piece);
      piece.currentX = target.x;
      piece.currentY = target.y;
      piece.style.left = `${target.x}px`;
      piece.style.top = `${target.y}px`;
      piece.classList.add('locked');
      piece.locked = true;
      audio.lock();
    });
  }
}

function onPointerDown(event) {
  if (state.solved) return;

  audio.activate();
  audio.click();

  const piece = event.target.closest('.piece');
  if (!piece || piece.locked) return;

  state.selectedPiece = piece;
  const rect = piece.getBoundingClientRect();
  piece.dataset.offsetX = String(event.clientX - rect.left);
  piece.dataset.offsetY = String(event.clientY - rect.top);
  piece.classList.add('dragging');
  piece.style.zIndex = '1000';
}

function onPointerMove(event) {
  if (!state.selectedPiece) return;

  const piece = state.selectedPiece;
  const offsetX = Number(piece.dataset.offsetX || 0);
  const offsetY = Number(piece.dataset.offsetY || 0);

  const left = clamp(event.clientX - board.getBoundingClientRect().left - offsetX, 0, board.clientWidth - piece.offsetWidth);
  const top = clamp(event.clientY - board.getBoundingClientRect().top - offsetY, 0, board.clientHeight - piece.offsetHeight);

  piece.style.left = `${left}px`;
  piece.style.top = `${top}px`;
  piece.currentX = left;
  piece.currentY = top;
}

function onPointerUp() {
  if (!state.selectedPiece) return;

  const piece = state.selectedPiece;
  piece.classList.remove('dragging');

  if (isNearTarget(piece)) {
    const target = getTargetPosition(piece);
    piece.currentX = target.x;
    piece.currentY = target.y;
    piece.style.left = `${target.x}px`;
    piece.style.top = `${target.y}px`;
    piece.classList.add('locked');
    piece.locked = true;
    audio.lock();
  }

  state.moveCount += 1;
  updateHUD();
  state.selectedPiece = null;
  checkSolved();
}

function resetGame() {
  state.solved = false;
  state.moveCount = 0;
  state.selectedPiece = null;
  startTimer();
  buildPuzzle();
  updateHUD();
}

function setDifficulty(levelName) {
  state.currentLevel = levelName;
  difficultyButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.level === levelName);
  });
  resetGame();
}

board.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);

shuffleBtn.addEventListener('click', () => {
  audio.activate();
  audio.click();
  state.solved = false;
  state.moveCount = 0;
  startTimer();
  buildPuzzle();
  updateHUD();
});

resetBtn.addEventListener('click', () => {
  audio.activate();
  audio.click();
  resetGame();
});

difficultyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    audio.activate();
    audio.click();
    setDifficulty(button.dataset.level);
  });
});

window.addEventListener('resize', () => {
  if (state.pieces.length > 0) {
    buildPuzzle();
  }
});

window.addEventListener('pointerdown', () => {
  audio.activate();
}, { once: true });

startTimer();
buildPuzzle();
updateHUD();
