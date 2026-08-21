import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const Login = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '9898') {
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ backgroundColor: 'var(--color-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem' }}>
        <Lock size={40} />
      </div>
      <h1 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Gajanan Enterprises</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Enter PIN to unlock</p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
        <input 
          type="password" 
          inputMode="numeric"
          pattern="[0-9]*"
          className="form-control text-center" 
          style={{ fontSize: '1.5rem', letterSpacing: '0.5em', padding: '1rem', marginBottom: '1rem', borderColor: error ? 'var(--color-absent)' : '' }}
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
        <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Unlock App</button>
      </form>
    </div>
  );
};

export default Login;
