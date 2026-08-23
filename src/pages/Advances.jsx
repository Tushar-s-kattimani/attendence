import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Banknote } from 'lucide-react';

const Advances = () => {
  const { employees, advances, giveAdvance, getRealtimeAdvanceBalance } = useAppContext();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amount, setAmount] = useState('');
  
  const [activeTab, setActiveTab] = useState(null);
  
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  
  const handleGiveAdvance = (e) => {
    e.preventDefault();
    if (!selectedEmployee || !amount) return;
    
    const today = new Date().toISOString().split('T')[0];
    giveAdvance(selectedEmployee, amount, today, "");
    
    setSelectedEmployee('');
    setAmount('');
  };

  const sortedAdvances = [...advances].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="mb-4">
        <h2>Advances</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Manage employee advances</p>
      </div>

      <div className="card mb-4">
        <h3 className="mb-4">Give New Advance</h3>
        <form onSubmit={handleGiveAdvance}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select 
              className="form-control" 
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
            >
              <option value="">Select Employee</option>
              {activeEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              min="1"
            />
          </div>
          
          <div className="mt-4">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Give Advance
            </button>
          </div>
        </form>
      </div>

      <div className="flex mb-4 gap-2">
        <button 
          className={`btn ${activeTab === 'balances' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1, padding: '0.5rem' }}
          onClick={() => setActiveTab(activeTab === 'balances' ? null : 'balances')}
        >
          Current Balances
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`} 
          style={{ flex: 1, padding: '0.5rem' }}
          onClick={() => setActiveTab(activeTab === 'history' ? null : 'history')}
        >
          Recent Transactions
        </button>
      </div>

      {activeTab === 'balances' && (
        <div className="mb-4 fade-in-up">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th style={{ textAlign: 'right' }}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map(emp => {
                  const balance = getRealtimeAdvanceBalance(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: '500' }}>{emp.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: balance > 0 ? '#ef4444' : 'inherit' }}>
                        ₹{balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mb-4 fade-in-up">
          {sortedAdvances.length === 0 ? (
            <div className="card text-center">
              <p className="text-muted">No advances given yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAdvances.slice(0, 20).map((adv, idx) => {
                    const emp = employees.find(e => e.id === adv.employeeId);
                    return (
                      <tr key={adv.id || idx}>
                        <td>{adv.date}</td>
                        <td>{emp ? emp.name : 'Unknown'}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>₹{Number(adv.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      <div style={{ height: '2rem' }}></div>
    </div>
  );
};

export default Advances;
