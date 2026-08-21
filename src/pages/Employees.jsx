import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    salary: '',
    status: 'Active'
  });

  const handleOpenForm = (emp = null) => {
    if (emp) {
      setFormData(emp);
      setEditingId(emp.id);
    } else {
      setFormData({
        name: '',
        salary: '',
        status: 'Active'
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateEmployee({ ...formData, id: editingId });
    } else {
      addEmployee(formData);
    }
    handleCloseForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Employees</h2>
        {!showForm && (
          <button className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => handleOpenForm()}>
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>{editingId ? 'Edit Employee' : 'Add Employee'}</h3>
            <button onClick={handleCloseForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} className="text-muted" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Employee Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Salary (₹) *</label>
              <input type="number" className="form-control" required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="500" min="0" />
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Employee' : 'Save Employee'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="employee-list mb-4">
          {employees.length === 0 ? (
            <div className="card text-center">
              <p>No employees added yet.</p>
            </div>
          ) : (
            employees.map(emp => (
              <div className="employee-item" key={emp.id} style={{ opacity: emp.status === 'Inactive' ? 0.6 : 1 }}>
                <div className="emp-info">
                  <div className="emp-avatar" style={{ backgroundColor: emp.status === 'Inactive' ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="emp-details">
                    <h3>{emp.name} {emp.status === 'Inactive' && <span style={{fontSize: '0.7rem', backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px'}}>Inactive</span>}</h3>
                    <p>₹{emp.salary}/day</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenForm(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-absent)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Employees;
