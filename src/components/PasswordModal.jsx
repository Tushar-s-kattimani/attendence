import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const PasswordModal = ({ onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '9898') {
      onSuccess();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Authentication Required</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Enter PIN to edit attendance</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control text-center" 
            style={{ fontSize: '1.5rem', letterSpacing: '0.5em', padding: '0.75rem', marginBottom: '1rem', borderColor: error ? 'var(--color-absent)' : '' }}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="••••"
            maxLength={4}
            autoFocus
          />
          {error && <p style={{ color: 'var(--color-absent)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>Incorrect PIN</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Unlock</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
