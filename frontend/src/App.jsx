import { useState, useCallback } from 'react';
import InputCard from './components/InputCard';
import UserCard from './components/UserCard';
import SummaryCard from './components/SummaryCard';
import HierarchyCard from './components/HierarchyCard';
import BadgeList from './components/BadgeList';
import './App.css';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/bfhl'
    : '/bfhl';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (rawInput) => {
    setError('');
    setResult(null);

    const data = rawInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (data.length === 0) {
      setError('Please enter at least one edge (e.g. A->B).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded with ${res.status}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || 'Failed to reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {/* Hero */}
      <header className="hero">
        <h1>🌳 Tree Hierarchy Analyzer</h1>
        <p>Parse directed edges · detect cycles · visualize hierarchies</p>
      </header>

      {/* Input */}
      <InputCard onSubmit={handleSubmit} loading={loading} error={error} />

      {/* Results */}
      {result && (
        <div className="results-wrapper">
          <UserCard
            userId={result.user_id}
            email={result.email_id}
            rollNumber={result.college_roll_number}
          />

          <SummaryCard summary={result.summary} />

          {/* Hierarchies */}
          <section className="card" style={{ animationDelay: '.15s' }}>
            <div className="card-title"><span className="dot" /> Hierarchies</div>
            {result.hierarchies && result.hierarchies.length > 0 ? (
              result.hierarchies.map((h, i) => (
                <HierarchyCard key={`${h.root}-${i}`} hierarchy={h} index={i} />
              ))
            ) : (
              <div className="empty-state">No hierarchies to display.</div>
            )}
          </section>

          {/* Invalid Entries */}
          <section className="card" style={{ animationDelay: '.2s' }}>
            <div className="card-title"><span className="dot" /> Invalid Entries</div>
            {result.invalid_entries && result.invalid_entries.length > 0 ? (
              <BadgeList items={result.invalid_entries} variant="red" />
            ) : (
              <div className="empty-state">None — all entries were valid.</div>
            )}
          </section>

          {/* Duplicate Edges */}
          <section className="card" style={{ animationDelay: '.25s' }}>
            <div className="card-title"><span className="dot" /> Duplicate Edges</div>
            {result.duplicate_edges && result.duplicate_edges.length > 0 ? (
              <BadgeList items={result.duplicate_edges} variant="amber" />
            ) : (
              <div className="empty-state">None — no duplicates found.</div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
