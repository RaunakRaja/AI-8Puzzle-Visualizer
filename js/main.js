/**
 * main.js
 * Wires up navigation, the puzzle-input form, running the DFS search,
 * stepping/playing back its trace, and populating the summary +
 * comparison panels. All algorithm logic lives in puzzle.js / dfs.js;
 * this file is purely UI plumbing.
 */

(function () {
  let lastResult = null;      // full runDFS() output
  let currentInitial = null;  // board actually used for the last run
  let currentGoal = null;
  let stepIndex = -1;         // -1 = nothing shown yet
  let autoplayTimer = null;
  let solutionTimer = null;

  // ---------- Navigation ----------
  const navButtons = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-section');

  function showPage(id) {
    pages.forEach(p => p.classList.toggle('active', p.id === `page-${id}`));
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.page === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // ---------- Input grid construction ----------
  function buildInputGrid(container, prefix) {
    container.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '8';
      input.id = `${prefix}-${i}`;
      input.className = 'cell-input';
      container.appendChild(input);
    }
  }

  function readGrid(prefix) {
    const board = [];
    for (let i = 0; i < 9; i++) {
      const el = document.getElementById(`${prefix}-${i}`);
      board.push(parseInt(el.value, 10));
    }
    return board;
  }

  function writeGrid(prefix, board) {
    board.forEach((v, i) => {
      document.getElementById(`${prefix}-${i}`).value = v;
    });
  }

  const initialGridEl = document.getElementById('initial-input-grid');
  const goalGridEl = document.getElementById('goal-input-grid');
  buildInputGrid(initialGridEl, 'initial');
  buildInputGrid(goalGridEl, 'goal');

  const EXAMPLE_INITIAL = [2, 8, 3, 1, 6, 4, 7, 0, 5];
  const EXAMPLE_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  writeGrid('initial', EXAMPLE_INITIAL);
  writeGrid('goal', EXAMPLE_GOAL);

  const validationMsg = document.getElementById('input-validation-msg');
  const btnRun = document.getElementById('btn-run');

  function validateInputs() {
    const initial = readGrid('initial');
    const goal = readGrid('goal');
    let msg = '';
    let ok = true;

    if (!isValidBoard(initial)) {
      ok = false;
      msg = 'Initial state must use each of 0-8 exactly once (0 = blank).';
    } else if (!isValidBoard(goal)) {
      ok = false;
      msg = 'Goal state must use each of 0-8 exactly once (0 = blank).';
    } else if (!isSolvablePair(initial, goal)) {
      ok = false;
      msg = 'This initial state can never reach this goal state (odd/even permutation mismatch). Try "Generate Random Puzzle" instead.';
    } else {
      msg = 'Looks good — this puzzle is solvable.';
    }

    validationMsg.textContent = msg;
    validationMsg.className = 'validation-msg ' + (ok ? 'ok' : 'error');
    btnRun.disabled = !ok;
    return ok ? { initial, goal } : null;
  }

  document.getElementById('btn-load-example').addEventListener('click', () => {
    writeGrid('initial', EXAMPLE_INITIAL);
    writeGrid('goal', EXAMPLE_GOAL);
    validateInputs();
  });

  document.getElementById('btn-random').addEventListener('click', () => {
    const goal = isValidBoard(readGrid('goal')) ? readGrid('goal') : DEFAULT_GOAL;
    writeGrid('goal', goal);
    writeGrid('initial', generateRandomSolvable(goal));
    validateInputs();
  });

  initialGridEl.addEventListener('input', validateInputs);
  goalGridEl.addEventListener('input', validateInputs);
  validateInputs();

  // ---------- Puzzle / search-process visualization ----------
  const vizInitial = document.getElementById('viz-initial');
  const vizGoal = document.getElementById('viz-goal');
  const vizCurrent = document.getElementById('viz-current');
  const vizParent = document.getElementById('viz-parent');
  const stepLabel = document.getElementById('step-label');
  const frontierList = document.getElementById('frontier-list');
  const exploredList = document.getElementById('explored-list');

  const statGenerated = document.getElementById('stat-generated');
  const statExpanded = document.getElementById('stat-expanded');
  const statFrontierSize = document.getElementById('stat-frontier-size');
  const statExploredSize = document.getElementById('stat-explored-size');
  const statDepth = document.getElementById('stat-depth');
  const statPathCost = document.getElementById('stat-pathcost');
  const statMove = document.getElementById('stat-move');

  function clearSearchPanels() {
    [vizCurrent, vizParent].forEach(el => { el.innerHTML = ''; });
    frontierList.innerHTML = '';
    exploredList.innerHTML = '';
    stepLabel.textContent = 'No search run yet';
    [statGenerated, statExpanded, statFrontierSize, statExploredSize, statDepth, statPathCost, statMove]
      .forEach(el => { el.textContent = '—'; });
  }

  function showStep(i) {
    if (!lastResult || i < 0 || i >= lastResult.trace.length) return;
    stepIndex = i;
    const entry = lastResult.trace[i];
    const prevBoard = i > 0 ? lastResult.trace[i - 1].board : currentInitial;

    renderBoardAnimated(vizCurrent, prevBoard, entry.board);
    vizParent.innerHTML = '';
    if (entry.parentBoard) vizParent.appendChild(renderMiniBoard(entry.parentBoard));

    stepLabel.textContent = `Step ${i + 1} of ${lastResult.trace.length} — expanding node #${entry.nodeId}`;
    statGenerated.textContent = entry.nodesGeneratedSoFar;
    statExpanded.textContent = entry.nodesExpandedSoFar;
    statFrontierSize.textContent = entry.frontierSize;
    statExploredSize.textContent = entry.exploredSize;
    statDepth.textContent = entry.depth;
    statPathCost.textContent = entry.pathCost;
    statMove.textContent = entry.move || '(start state)';

    frontierList.innerHTML = '';
    entry.frontierSample.slice().reverse().forEach(b => frontierList.appendChild(renderMiniBoard(b)));
    if (entry.frontierSize > entry.frontierSample.length) {
      const note = document.createElement('div');
      note.className = 'list-note';
      note.textContent = `+ ${entry.frontierSize - entry.frontierSample.length} more on stack`;
      frontierList.appendChild(note);
    }

    exploredList.innerHTML = '';
    lastResult.trace.slice(Math.max(0, i - 5), i).forEach(t => exploredList.appendChild(renderMiniBoard(t.board)));
    exploredList.appendChild(renderMiniBoard(entry.board, { highlight: true }));
    if (entry.exploredSize > 6) {
      const note = document.createElement('div');
      note.className = 'list-note';
      note.textContent = `+ ${entry.exploredSize - 6} more explored`;
      exploredList.appendChild(note);
    }

    if (i === lastResult.trace.length - 1) {
      pauseAutoplay();
      populateSummary(lastResult);
    }
  }

  function pauseAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }

  function startAutoplay() {
    if (!lastResult || autoplayTimer) return;
    const speed = parseInt(document.getElementById('select-speed').value, 10);
    autoplayTimer = setInterval(() => {
      if (stepIndex >= lastResult.trace.length - 1) { pauseAutoplay(); return; }
      showStep(stepIndex + 1);
    }, speed);
  }

  document.getElementById('btn-play').addEventListener('click', startAutoplay);
  document.getElementById('btn-resume').addEventListener('click', startAutoplay);
  document.getElementById('btn-pause').addEventListener('click', pauseAutoplay);
  document.getElementById('btn-next').addEventListener('click', () => showStep(stepIndex + 1));
  document.getElementById('btn-prev').addEventListener('click', () => showStep(stepIndex - 1));
  document.getElementById('btn-reset-playback').addEventListener('click', () => {
    pauseAutoplay();
    stepIndex = -1;
    clearSearchPanels();
    if (currentInitial) renderBoard(vizCurrent, currentInitial);
    document.getElementById('solution-summary').classList.add('hidden');
    document.getElementById('btn-play-solution').disabled = true;
  });

  // ---------- Run search ----------
  btnRun.addEventListener('click', () => {
    const inputs = validateInputs();
    if (!inputs) return;

    pauseAutoplay();
    if (solutionTimer) { clearInterval(solutionTimer); solutionTimer = null; }

    currentInitial = inputs.initial;
    currentGoal = inputs.goal;
    renderBoard(vizInitial, currentInitial);
    renderBoard(vizGoal, currentGoal);
    renderBoard(vizCurrent, currentInitial);

    const maxDepth = parseInt(document.getElementById('input-maxdepth').value, 10) || 30;
    const nodeLimit = parseInt(document.getElementById('input-nodelimit').value, 10) || 40000;

    lastResult = runDFS(currentInitial, currentGoal, { maxDepth, nodeLimit });
    stepIndex = -1;
    clearSearchPanels();
    stepLabel.textContent = `Search complete: ${lastResult.trace.length} expansion(s) recorded. Use Play or Next Step to replay.`;
    document.getElementById('solution-summary').classList.add('hidden');
    document.getElementById('btn-play-solution').disabled = !lastResult.found;

    if (!lastResult.found) {
      const reason = lastResult.limitHit
        ? `the node cap (${nodeLimit}) was reached before a goal was found`
        : `the frontier was fully exhausted within the ${maxDepth}-move depth limit without reaching the goal`;
      validationMsg.textContent = `No solution found this run — ${reason}. This is a genuine, expected outcome for DFS (see Algorithm Info: it is not complete under a bounded depth/node budget). Try raising Max Depth / Node Cap above, or a different puzzle instance.`;
      validationMsg.className = 'validation-msg error';
    }
  });

  // ---------- Solution path animation ----------
  const vizSolution = document.getElementById('viz-solution');
  const solutionStepLabel = document.getElementById('solution-step-label');

  document.getElementById('btn-play-solution').addEventListener('click', () => {
    if (!lastResult || !lastResult.found) return;
    if (solutionTimer) clearInterval(solutionTimer);
    const path = lastResult.path;
    let i = 0;
    renderBoard(vizSolution, path[0].board);
    solutionStepLabel.textContent = `Step 0 of ${path.length - 1} (start state)`;
    const speed = parseInt(document.getElementById('select-speed').value, 10);

    solutionTimer = setInterval(() => {
      i++;
      if (i >= path.length) { clearInterval(solutionTimer); solutionTimer = null; return; }
      renderBoardAnimated(vizSolution, path[i - 1].board, path[i].board);
      solutionStepLabel.textContent = `Step ${i} of ${path.length - 1} — moved blank ${path[i].move}`;
    }, Math.max(speed, 400));
  });

  // ---------- Solution summary ----------
  function populateSummary(result) {
    const panel = document.getElementById('solution-summary');
    panel.classList.remove('hidden');
    document.getElementById('summary-status').textContent = result.found ? 'Solution Found' : 'Not Found';
    document.getElementById('summary-status').className = result.found ? 'value ok' : 'value error';
    document.getElementById('summary-moves').textContent = result.found ? result.path.length - 1 : '—';
    document.getElementById('summary-generated').textContent = result.nodesGenerated;
    document.getElementById('summary-expanded').textContent = result.nodesExpanded;
    document.getElementById('summary-maxdepth').textContent = result.maxDepthReached;
    document.getElementById('summary-time').textContent = `${result.executionTimeMs} ms`;
    document.getElementById('summary-pathcost').textContent = result.found ? result.pathCost : '—';
    document.getElementById('summary-memory').textContent = `~${result.approxMemoryKB} KB`;

    // Keep the Comparison page's DFS row in sync with the latest run.
    document.getElementById('cmp-dfs-found').textContent = result.found ? 'Yes' : 'No';
    document.getElementById('cmp-dfs-expanded').textContent = result.nodesExpanded;
    document.getElementById('cmp-dfs-moves').textContent = result.found ? result.path.length - 1 : '—';
    document.getElementById('cmp-dfs-time').textContent = `${result.executionTimeMs} ms`;
    document.getElementById('cmp-dfs-memory').textContent = `~${result.approxMemoryKB} KB`;
  }

  // ---------- Init ----------
  clearSearchPanels();
  renderBoard(vizInitial, EXAMPLE_INITIAL);
  renderBoard(vizGoal, EXAMPLE_GOAL);
  renderBoard(vizCurrent, EXAMPLE_INITIAL);
})();
