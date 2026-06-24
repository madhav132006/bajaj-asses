import './BadgeList.css';

export default function BadgeList({ items, variant = 'red' }) {
  return (
    <div className="badge-list">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`badge badge-${variant}`}>
          {item || '(empty)'}
        </span>
      ))}
    </div>
  );
}
