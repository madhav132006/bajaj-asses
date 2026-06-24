const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Personal Details ────────────────────────────────────────────────
const USER_ID = "Madhav_13022006";
const EMAIL_ID = "madhav1336.be23@chitkara.edu.in";
const ROLL_NUMBER = "2310991336";

// ─── Union-Find (Disjoint Set) ──────────────────────────────────────
class UnionFind {
  constructor() {
    this.parent = {};
    this.rank = {};
  }

  find(x) {
    if (!(x in this.parent)) {
      this.parent[x] = x;
      this.rank[x] = 0;
    }
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
  }
}

// ─── POST /bfhl ─────────────────────────────────────────────────────
app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "data must be an array of strings" });
    }

    const invalidEntries = [];
    const validEdges = [];       // after format + self-loop validation
    const edgePattern = /^[A-Z]->[A-Z]$/;

    // ── STEP 1: Validate each entry ──────────────────────────────────
    for (const raw of data) {
      const entry = typeof raw === "string" ? raw.trim() : String(raw).trim();

      if (!edgePattern.test(entry)) {
        invalidEntries.push(entry);
        continue;
      }

      const [from, to] = entry.split("->");

      if (from === to) {
        // self-loop
        invalidEntries.push(entry);
        continue;
      }

      validEdges.push({ from, to, raw: entry });
    }

    // ── STEP 2: Detect duplicates ────────────────────────────────────
    const seen = new Set();
    const duplicateSet = new Set();
    const deduped = [];

    for (const edge of validEdges) {
      if (seen.has(edge.raw)) {
        duplicateSet.add(edge.raw);
      } else {
        seen.add(edge.raw);
        deduped.push(edge);
      }
    }

    const duplicateEdges = [...duplicateSet];

    // ── STEP 3: Build trees ──────────────────────────────────────────

    // 3a — Multi-parent rule: first parent wins
    const childParent = {}; // child -> parent (first occurrence)
    const acceptedEdges = [];

    for (const edge of deduped) {
      if (edge.to in childParent) {
        // silently discard — child already has a parent
        continue;
      }
      childParent[edge.to] = edge.from;
      acceptedEdges.push(edge);
    }

    // 3b — Union-Find to group connected components
    const uf = new UnionFind();
    const allNodes = new Set();

    for (const edge of acceptedEdges) {
      allNodes.add(edge.from);
      allNodes.add(edge.to);
      uf.union(edge.from, edge.to);
    }

    // Group nodes by component root
    const groups = {};
    for (const node of allNodes) {
      const root = uf.find(node);
      if (!groups[root]) groups[root] = new Set();
      groups[root].add(node);
    }

    // Build adjacency list from accepted edges
    const adj = {};
    const childSet = new Set(); // nodes that appear as children

    for (const edge of acceptedEdges) {
      if (!adj[edge.from]) adj[edge.from] = [];
      adj[edge.from].push(edge.to);
      childSet.add(edge.to);
    }

    // ── Process each connected group ─────────────────────────────────
    const hierarchies = [];

    for (const groupNodes of Object.values(groups)) {
      const nodes = [...groupNodes];

      // Find roots: nodes that are NOT children
      const roots = nodes.filter((n) => !childSet.has(n));

      let root;
      if (roots.length === 0) {
        // Pure cycle — all nodes are children; pick lexicographically smallest
        root = nodes.sort().at(0);
      } else {
        // Pick lexicographically smallest root if there are multiple
        root = roots.sort().at(0);
      }

      // Cycle detection via DFS
      const hasCycle = detectCycle(nodes, adj);

      if (hasCycle) {
        hierarchies.push({ root, tree: {}, has_cycle: true });
      } else {
        const tree = buildTree(root, adj);
        const depth = calcDepth(tree);
        hierarchies.push({ root, tree, depth });
      }
    }

    // ── STEP 4: Build summary ────────────────────────────────────────
    const trees = hierarchies.filter((h) => !h.has_cycle);
    const cycles = hierarchies.filter((h) => h.has_cycle);

    let largestTreeRoot = "";
    let maxDepth = 0;

    for (const t of trees) {
      if (
        t.depth > maxDepth ||
        (t.depth === maxDepth && t.root < largestTreeRoot)
      ) {
        maxDepth = t.depth;
        largestTreeRoot = t.root;
      }
    }

    const summary = {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root: largestTreeRoot || null,
    };

    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: ROLL_NUMBER,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary,
    });
  } catch (err) {
    console.error("Error processing /bfhl:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Detect if there is a cycle among the given nodes using DFS with
 * WHITE/GRAY/BLACK coloring.
 */
function detectCycle(nodes, adj) {
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = {};
  for (const n of nodes) color[n] = WHITE;

  function dfs(u) {
    color[u] = GRAY;
    for (const v of adj[u] || []) {
      if (!(v in color)) continue; // not in this group
      if (color[v] === GRAY) return true;
      if (color[v] === WHITE && dfs(v)) return true;
    }
    color[u] = BLACK;
    return false;
  }

  for (const n of nodes) {
    if (color[n] === WHITE && dfs(n)) return true;
  }
  return false;
}

/**
 * Build nested tree object starting from `root`.
 */
function buildTree(root, adj) {
  const children = adj[root] || [];
  const subtree = {};
  for (const child of children) {
    Object.assign(subtree, buildTree(child, adj));
  }
  return { [root]: subtree };
}

/**
 * Calculate tree depth = number of nodes on the longest root-to-leaf path.
 */
function calcDepth(tree) {
  const keys = Object.keys(tree);
  if (keys.length === 0) return 0;
  const root = keys[0];
  const children = tree[root];
  const childKeys = Object.keys(children);
  if (childKeys.length === 0) return 1;
  let maxChildDepth = 0;
  for (const ck of childKeys) {
    const d = calcDepth({ [ck]: children[ck] });
    if (d > maxChildDepth) maxChildDepth = d;
  }
  return 1 + maxChildDepth;
}

// ─── Serve frontend ──────────────────────────────────────────────────
const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
const frontendStaticPath = path.join(__dirname, "..", "frontend");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else {
  app.use(express.static(frontendStaticPath));
}

// ─── Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BFHL server running on http://localhost:${PORT}`);
});
