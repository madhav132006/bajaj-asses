import './UserCard.css';

export default function UserCard({ userId, email, rollNumber }) {
  const initial = (userId || '?').charAt(0).toUpperCase();

  return (
    <section className="card user-card" style={{ animationDelay: '.05s' }}>
      <div className="card-title"><span className="dot" /> Submitted By</div>

      <div className="user-profile-header">
        <div className="user-avatar">{initial}</div>
        <div className="user-profile-info">
          <div className="user-name">{userId}</div>
          <div className="user-org">Chitkara University</div>
        </div>
      </div>

      <div className="user-details-grid">
        <div className="user-field full-width">
          <div className="field-label">Email</div>
          <div className="field-value">{email}</div>
        </div>
        <div className="user-field">
          <div className="field-label">Roll Number</div>
          <div className="field-value">{rollNumber}</div>
        </div>
        <div className="user-field">
          <div className="field-label">User ID</div>
          <div className="field-value">{userId}</div>
        </div>
      </div>
    </section>
  );
}
