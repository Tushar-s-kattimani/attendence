import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Banknote, Trash2 } from 'lucide-react';

const Advances = () => {
  const { employees, advances, giveAdvance, getRealtimeAdvanceBalance, deleteAdvance } = useAppContext();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amount, setAmount] = useState('');
  
  const [activeTab, setActiveTab] = useState(null);
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const monthOptions = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const yearOptions = [];
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) {
    yearOptions.push(i);
  }
  
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  
  const handleGiveAdvance = (e) => {
    e.preventDefault();
    if (!selectedEmployee || !amount) return;
    
    const today = new Date().toISOString().split('T')[0];
    giveAdvance(selectedEmployee, amount, today, "");
    
    setSelectedEmployee('');
    setAmount('');
  };

  const filteredAdvances = advances.filter(adv => {
    if (!adv.date) return false;
    const [y, m] = adv.date.split('-');
    return parseInt(y, 10) === filterYear && parseInt(m, 10) === filterMonth;
  });

  const sortedAdvances = [...filteredAdvances].sort((a, b) => new Date(b.date) - new Date(a.date));

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
          <div className="card grid-2 mb-4">
            <div className="form-group mb-0">
              <label className="form-label">Month</label>
              <select 
                className="form-control" 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(Number(e.target.value))}
              >
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Year</label>
              <select 
                className="form-control" 
                value={filterYear} 
                onChange={(e) => setFilterYear(Number(e.target.value))}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
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
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAdvances.slice(0, 20).map((adv, idx) => {
                    const emp = employees.find(e => e.id === adv.employeeId);
                    return (
                      <tr key={adv.id || idx}>
                        <td>{adv.date ? adv.date.split('-').reverse().join('/') : ''}</td>
                        <td>{emp ? emp.name : 'Unknown'}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>₹{Number(adv.amount).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          {adv.id && (
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '0.25rem 0.5rem', borderColor: '#fee2e2', color: '#ef4444', border: 'none' }}
                              onClick={() => {
                                const password = window.prompt('Enter password to delete:');
                                if (password === '9898') {
                                  deleteAdvance(adv.id);
                                } else if (password !== null) {
                                  alert('Incorrect password!');
                                }
                              }}
                              title="Delete Transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
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
