/**
 * visualizer.js
 * DOM rendering for puzzle boards: the main 3x3 grid, small "mini" grids
 * used in the frontier/explored panels, and a lightweight highlight
 * animation that marks whichever tile moved on each step.
 */

function renderBoard(container, board) {
  container.innerHTML = '';
  container.classList.add('puzzle-grid');
  board.forEach((val) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile' + (val === 0 ? ' blank' : '');
    tile.textContent = val === 0 ? '' : val;
    container.appendChild(tile);
  });
}

/**
 * Renders `board`, then briefly highlights the two cells that changed
 * (the blank's old position and its new position) to draw the eye to
 * the move that just happened.
 */
function renderBoardAnimated(container, prevBoard, board) {
  renderBoard(container, board);
  if (!prevBoard) return;
  const blankBefore = prevBoard.indexOf(0);
  const blankAfter = board.indexOf(0);
  [blankBefore, blankAfter].forEach((idx) => {
    const tile = container.children[idx];
    if (!tile) return;
    tile.classList.add('tile-move');
    setTimeout(() => tile.classList.remove('tile-move'), 500);
  });
}

function renderMiniBoard(board, { highlight = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'mini-grid' + (highlight ? ' mini-grid-current' : '');
  board.forEach((val) => {
    const c = document.createElement('div');
    c.className = 'mini-cell' + (val === 0 ? ' blank' : '');
    c.textContent = val === 0 ? '' : val;
    wrap.appendChild(c);
  });
  return wrap;
}

function boardToRows(board) {
  return [board.slice(0, 3), board.slice(3, 6), board.slice(6, 9)];
}
