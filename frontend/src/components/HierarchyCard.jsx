import './HierarchyCard.css';

/**
 * Recursively render nested tree object as indented visual lines.
 */
function TreeNode({ name, children, depth = 0, isLast = true, prefix = '' }) {
  const isRoot = depth === 0;
  const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
  const nodeClass = isRoot ? 'tree-root-node' : 'tree-node';

  const childKeys = Object.keys(children);
  const nextPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');

  return (
    <>
      <div className="tree-line">
        <span className="tree-branch">{prefix}{connector}</span>
        <span className={nodeClass}>{name}</span>
      </div>
      {childKeys.map((key, i) => (
        <TreeNode
          key={key}
          name={key}
          children={children[key]}
          depth={depth + 1}
          isLast={i === childKeys.length - 1}
          prefix={nextPrefix}
        />
      ))}
    </>
  );
}

export default function HierarchyCard({ hierarchy, index }) {
  const { root, tree, depth, has_cycle: hasCycle } = hierarchy;

  return (
    <div
      className="hierarchy-card"
      style={{ animationDelay: `${0.06 * (index + 1)}s` }}
    >
      {/* Header */}
      <div className="hierarchy-header">
        <div className="root-badge">{root}</div>
        <div className="hierarchy-meta">
          <strong>Root: {root}</strong>
        </div>
        {hasCycle ? (
          <span className="cycle-badge">⚠ Cycle Detected</span>
        ) : (
          <span className="depth-badge">Depth {depth}</span>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="tree-visual">
        {hasCycle ? (
          <span className="tree-cycle-msg">Cycle — no tree representation available.</span>
        ) : (
          Object.keys(tree).map((key) => (
            <TreeNode key={key} name={key} children={tree[key]} />
          ))
        )}
      </div>
    </div>
  );
}
