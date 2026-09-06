/**
 * dfs.js
 * Depth-First Search — the algorithm assigned for this submission
 * (Algorithm Number 2, per the assignment's allotment table).
 *
 * Implementation notes (see the Algorithm Info page for the full writeup):
 * DFS explores using a LIFO stack, expanding the most recently generated
 * node first. The 8-puzzle's reachable state space is finite (181,440
 * states for a given parity class), so plain DFS with a visited/explored
 * set is technically complete on it — but an unbounded run can still walk
 * extremely long, low-quality branches before finding the goal. To keep
 * the visualizer responsive in a browser tab, this implementation accepts
 * a `maxDepth` cutoff and a `nodeLimit` safety cap, both adjustable from
 * the Solver page's Advanced Settings.
 */

function runDFS(initialBoard, goalBoard, options = {}) {
  const maxDepth = options.maxDepth ?? 30;
  const nodeLimit = options.nodeLimit ?? 20000;

  const startTime = performance.now();

  const nodes = [{
    id: 0, board: cloneBoard(initialBoard), parent: null,
    move: null, depth: 0, cost: 0
  }];
  const frontier = [0];                              // stack of node ids
  const exploredKeys = new Set();                     // states already expanded
  const frontierKeys = new Set([boardToKey(initialBoard)]);
  const trace = [];                                   // one entry per expansion

  let nodesGenerated = 1;
  let nodesExpanded = 0;
  let maxDepthReached = 0;
  let maxFrontierSize = 1;
  let solutionNode = null;
  let limitHit = null;

  while (frontier.length > 0) {
    const currentId = frontier.pop();                 // LIFO -> depth-first
    const current = nodes[currentId];
    const key = boardToKey(current.board);

    if (exploredKeys.has(key)) continue;               // stale duplicate on stack
    exploredKeys.add(key);
    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    trace.push({
      nodeId: current.id,
      board: current.board.slice(),
      parentBoard: current.parent !== null ? nodes[current.parent].board.slice() : null,
      move: current.move,
      depth: current.depth,
      pathCost: current.cost,
      frontierSize: frontier.length,
      exploredSize: exploredKeys.size,
      frontierSample: frontier.slice(-6).map(id => nodes[id].board.slice()),
      nodesGeneratedSoFar: nodesGenerated,
      nodesExpandedSoFar: nodesExpanded
    });

    if (isGoal(current.board, goalBoard)) {
      solutionNode = current;
      break;
    }

    if (current.depth < maxDepth) {
      const successors = getSuccessors(current.board);
      for (const succ of successors) {
        const succKey = boardToKey(succ.board);
        if (frontierKeys.has(succKey) || exploredKeys.has(succKey)) continue;
        const node = {
          id: nodes.length, board: succ.board, parent: current.id,
          move: succ.move, depth: current.depth + 1, cost: current.cost + succ.cost
        };
        nodes.push(node);
        frontier.push(node.id);
        frontierKeys.add(succKey);
        nodesGenerated++;
      }
      maxFrontierSize = Math.max(maxFrontierSize, frontier.length);
    }

    if (nodesGenerated >= nodeLimit) { limitHit = 'nodeLimit'; break; }
  }

  const endTime = performance.now();

  let path = [];
  if (solutionNode) {
    let n = solutionNode;
    while (n) {
      path.unshift(n);
      n = n.parent !== null ? nodes[n.parent] : null;
    }
  }

  // Rough approximate memory footprint: each stored node holds a 9-int
  // board plus small metadata, ~60 bytes is a reasonable ballpark.
  const approxMemoryKB = ((nodes.length * 60) / 1024).toFixed(1);

  return {
    algorithm: 'DFS',
    found: !!solutionNode,
    path,
    nodes,
    trace,
    nodesGenerated,
    nodesExpanded,
    maxDepthReached,
    maxFrontierSize,
    executionTimeMs: (endTime - startTime).toFixed(2),
    pathCost: solutionNode ? solutionNode.cost : null,
    approxMemoryKB,
    limitHit,
    maxDepthSetting: maxDepth,
    nodeLimitSetting: nodeLimit
  };
}
