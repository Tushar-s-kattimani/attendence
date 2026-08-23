import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PasswordModal from '../components/PasswordModal';
import { Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { resetAppData } = useAppContext();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleResetClick = () => {
    setShowPasswordModal(true);
  };

  const handleUnlockSuccess = () => {
    setShowPasswordModal(false);
    
    // Double confirmation for safety
    if (window.confirm("WARNING: This will permanently delete ALL attendance records and ALL advance histories. Only Employee profiles will be kept. Are you absolutely sure you want to reset the app data?")) {
      resetAppData();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2>Settings</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Manage application data and preferences</p>
      </div>

      {showSuccessAlert && (
        <div className="alert alert-success fade-in-up mb-4">
          All data has been successfully reset!
        </div>
      )}

      <div className="card mb-4">
        <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={20} /> Data Management
        </h3>
        
        <div style={{ border: '1px solid var(--color-danger)', borderRadius: '8px', padding: '1rem', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <AlertTriangle color="var(--color-danger)" size={24} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
            <div>
              <h4 style={{ color: 'var(--color-danger)', margin: '0 0 0.5rem 0' }}>Reset Application Data</h4>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                This action will permanently delete all daily attendance records AND all employee advance histories. 
                Use this to start a fresh tracking period (e.g., a new financial year).
                <br /><br />
                <strong>Note:</strong> Employee profiles (names, roles, daily salary) will remain intact.
              </p>
              <button className="btn" style={{ backgroundColor: 'var(--color-danger)', color: 'white' }} onClick={handleResetClick}>
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal 
          expectedPin="151571"
          actionText="reset data"
          onSuccess={handleUnlockSuccess} 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
};

export default Settings;
