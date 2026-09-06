# AI-8Puzzle-Visualizer

An interactive web application that solves the classic 8-Puzzle problem by
modelling it as a state-space search and visualizing the search step by
step. Built for the Artificial Intelligence course's Digital Assignment
(Case Study), implementing the algorithm allotted for this submission:
**Algorithm 2 — Depth-First Search (DFS)**.

## Project Description

The 8-Puzzle is a 3×3 sliding-tile puzzle with one blank cell. This tool
lets you enter (or randomly generate) an initial and goal state, runs DFS
over the resulting state-space graph, and then lets you replay the search
one expansion at a time — showing the current node, its parent, the
frontier (open list) and explored set (closed list), depth, and path cost
at every step — before animating the final solution path and reporting
summary statistics.

Per the assignment brief ("students must implement only the algorithm
allotted to them"), **only DFS is implemented**; the Comparison page
reflects that explicitly rather than inventing numbers for the other six
algorithms.

## Technologies Used

- HTML5, CSS3
- JavaScript (ES6, vanilla — no build step)
- Bootstrap 5 (via CDN) for base layout/utility classes
- Google Fonts: IBM Plex Mono (data/tile typography) and Manrope (UI/headings)

## Search Algorithm Implemented

- **Depth-First Search (DFS)** — iterative, stack-based, with a global
  explored/frontier set to avoid re-expanding states, a configurable
  **Max Depth Limit**, and a configurable **Node Generation Cap** as
  practical safety bounds. See the in-app **Algorithm Info** page for the
  full write-up (working principle, advantages, limitations, time/space
  complexity, completeness, and optimality).

  > Note: DFS is highly sensitive to these bounds. The shipped defaults
  > (Max Depth = 30, Node Cap = 40,000) reliably solve the built-in
  > example puzzle from the assignment brief. On harder or randomly
  > generated puzzles, DFS may legitimately report "no solution found"
  > at these settings — that is expected DFS behavior (see Limitations /
  > Completeness on the Algorithm Info page), not a bug. Raising the
  > limits, or trying a different puzzle, usually resolves it.

## Heuristics Used

Not applicable. The assignment only requires heuristic functions
(Misplaced Tiles, Manhattan Distance) for the informed algorithms —
Greedy Best-First Search and A* — neither of which is the algorithm
allotted for this submission.

## Screenshots

_Add screenshots of the Home, Solver (mid-search), Algorithm Info, and
Comparison pages here after running the app locally, e.g.:_

```
![Home page](images/home.png)
![Solver mid-search](images/solver.png)
```

## GitHub Pages URL

`https://<your-username>.github.io/AI-8Puzzle-Visualizer` — update after deploying (see below).

## Student Details

- **Name:** Raunak
- **Registration Number:** _[fill in]_
- **Course:** Artificial Intelligence
- **Assignment:** Digital Assignment (Case Study) — Interactive 8-Puzzle Problem Solver
- **Algorithm Assigned:** Algorithm 2 — Depth-First Search (DFS)

## References

- Russell, S. & Norvig, P., *Artificial Intelligence: A Modern Approach* — state-space search, uninformed search strategies, and DFS complexity/completeness/optimality analysis.
- MDN Web Docs — JavaScript (ES6), CSS Grid/Flexbox, `<input type="number">` reference.
- Bootstrap 5 documentation — layout and utility classes.
- Course lecture material for Artificial Intelligence (state-space search module).

## How to Run the Project

### Run locally

No build step or server is required — it's plain HTML/CSS/JS.

1. Clone the repository:
   ```
   git clone https://github.com/<your-username>/AI-8Puzzle-Visualizer.git
   cd AI-8Puzzle-Visualizer
   ```
2. Open `index.html` directly in a browser (double-click it, or drag it into
   a browser window). That's it.
   - Optional: serve it locally instead of using `file://` (some browsers
     are stricter about local file access) — e.g. `python3 -m http.server 8000`
     from the project folder, then visit `http://localhost:8000`.

### Deploy to GitHub Pages

1. Push this project to a GitHub repository named `AI-8Puzzle-Visualizer`.
2. In the repository, go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and the `/ (root)` folder, then **Save**.
4. Wait a minute for GitHub to build the site, then open the URL shown
   there — it will look like `https://<your-username>.github.io/AI-8Puzzle-Visualizer`.
5. Update the **GitHub Pages URL** section above (and your submission PDF)
   with that live link.

## Academic Integrity

Third-party resources used: Bootstrap 5 (CDN) for layout utilities and
Google Fonts (IBM Plex Mono, Manrope) for typography. All search-algorithm
logic (`js/puzzle.js`, `js/dfs.js`) and UI code (`js/visualizer.js`,
`js/main.js`) were written for this assignment.
