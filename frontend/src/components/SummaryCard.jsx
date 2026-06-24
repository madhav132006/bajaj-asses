import './SummaryCard.css';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const stats = [
    { value: summary.total_trees ?? 0,        label: 'Trees' },
    { value: summary.total_cycles ?? 0,       label: 'Cycles' },
    { value: summary.largest_tree_root || '—', label: 'Largest Tree Root' },
  ];

  return (
    <section className="card" style={{ animationDelay: '.1s' }}>
      <div className="card-title"><span className="dot" /> Summary</div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
