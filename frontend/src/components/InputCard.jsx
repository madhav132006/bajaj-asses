import { useState } from 'react';
import './InputCard.css';

export default function InputCard({ onSubmit, loading, error }) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="card input-card">
      <div className="card-title"><span className="dot" /> Input Edges</div>

      <textarea
        id="data-input"
        className="input-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Enter edges separated by commas or new lines, e.g.\nA->B, A->C, B->D, C->E, E->F\nX->Y, Y->Z, Z->X\nP->Q, Q->R`}
        spellCheck="false"
      />

      <button
        id="submit-btn"
        className={`btn${loading ? ' loading' : ''}`}
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? <span className="spinner" /> : <span>Analyze Hierarchies</span>}
      </button>

      {error && (
        <div className="error-alert" role="alert">
          ⚠ {error}
        </div>
      )}
    </section>
  );
}
