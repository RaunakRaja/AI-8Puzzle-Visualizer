/**
 * puzzle.js
 * Core state-space utilities for the 8-Puzzle.
 * A board is a flat array of 9 integers, positions 0..8 in row-major order:
 *    [0][1][2]
 *    [3][4][5]
 *    [6][7][8]
 * The value 0 represents the blank tile.
 */

const DEFAULT_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5]; // matches the assignment's example goal

function boardToKey(board) {
  return board.join(',');
}

function cloneBoard(board) {
  return board.slice();
}

function getBlankIndex(board) {
  return board.indexOf(0);
}

/**
 * Returns every legal successor of `board` as { board, move, cost }.
 * `move` names the direction the BLANK tile moves.
 */
function getSuccessors(board) {
  const successors = [];
  const blank = getBlankIndex(board);
  const row = Math.floor(blank / 3);
  const col = blank % 3;

  const candidates = [
    { name: 'Up', dr: -1, dc: 0 },
    { name: 'Down', dr: 1, dc: 0 },
    { name: 'Left', dr: 0, dc: -1 },
    { name: 'Right', dr: 0, dc: 1 }
  ];

  for (const m of candidates) {
    const nr = row + m.dr;
    const nc = col + m.dc;
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
    const swapIdx = nr * 3 + nc;
    const next = cloneBoard(board);
    next[blank] = next[swapIdx];
    next[swapIdx] = 0;
    successors.push({ board: next, move: m.name, cost: 1 });
  }
  return successors;
}

function isGoal(board, goal) {
  return boardToKey(board) === boardToKey(goal);
}

function isValidBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) return false;
  const seen = new Set(board);
  if (seen.size !== 9) return false;
  return board.every(v => Number.isInteger(v) && v >= 0 && v <= 8);
}

function countInversions(board) {
  const tiles = board.filter(v => v !== 0);
  let inv = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inv++;
    }
  }
  return inv;
}

/**
 * For a 3x3 (odd-width) grid, two configurations belong to the same
 * reachability class iff their tile-inversion parities match, regardless
 * of blank position. So `initial` is solvable relative to `goal` iff
 * their inversion counts have the same parity.
 */
function isSolvablePair(initial, goal) {
  return (countInversions(initial) % 2) === (countInversions(goal) % 2);
}

/**
 * Generates a random board that is GUARANTEED solvable relative to `goal`,
 * by taking `steps` random legal blank-moves starting from `goal` itself
 * (never reversing the immediately previous move, for better shuffling).
 */
function generateRandomSolvable(goal, steps = 120) {
  let board = cloneBoard(goal);
  let lastMove = null;
  const opposite = { Up: 'Down', Down: 'Up', Left: 'Right', Right: 'Left' };

  for (let i = 0; i < steps; i++) {
    const options = getSuccessors(board).filter(s => s.move !== opposite[lastMove]);
    const pick = options[Math.floor(Math.random() * options.length)];
    board = pick.board;
    lastMove = pick.move;
  }
  return board;
}
