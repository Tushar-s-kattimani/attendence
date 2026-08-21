import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save } from 'lucide-react';
import PasswordModal from '../components/PasswordModal';

const CustomCalendar = ({ selectedDate, onSelectDate, onClose, activeEmployees, attendanceRecords }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const recordsForDay = attendanceRecords[dateStr] || {};
      const markedCount = activeEmployees.filter(emp => recordsForDay[emp.id] !== undefined).length;
      
      let statusClass = '';
      if (activeEmployees.length > 0) {
        if (markedCount === activeEmployees.length) statusClass = 'status-green';
        else if (markedCount > 0) statusClass = 'status-yellow';
        else statusClass = 'status-red';
      }

      const isSelected = dateStr === selectedDate;

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${statusClass} ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            onSelectDate(dateStr);
            onClose();
          }}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={e => e.stopPropagation()}>
        <div className="calendar-header">
          <button onClick={handlePrevMonth} style={{ fontSize: '1.5rem' }}>&lt;</button>
          <div style={{ fontWeight: 'bold' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
          <button onClick={handleNextMonth} style={{ fontSize: '1.5rem' }}>&gt;</button>
        </div>
        <div className="calendar-body">
          <div className="calendar-weekdays">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className="calendar-grid">
            {renderDays()}
          </div>
        </div>
        <div className="calendar-footer">
          <button className="btn btn-outline" style={{ padding: '0.25rem 1rem', width: 'auto' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const Attendance = () => {
  const { employees, getAttendanceForDate, saveDailyAttendance, attendanceRecords } = useAppContext();
  
  const today = new Date();
  const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentRecords, setCurrentRecords] = useState({});
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const records = getAttendanceForDate(selectedDate);
    setCurrentRecords(records || {});
    setShowSavedAlert(false);
  }, [selectedDate, getAttendanceForDate]);

  const markedCount = activeEmployees.filter(emp => currentRecords[emp.id] !== undefined).length;
  const isFullyMarked = activeEmployees.length > 0 && markedCount === activeEmployees.length;

  const executeStatusChange = (empId, status) => {
    const updatedRecords = {
      ...currentRecords,
      [empId]: status
    };
    setCurrentRecords(updatedRecords);
    saveDailyAttendance(selectedDate, updatedRecords);
    
    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 2000);
  };

  const handleStatusChange = (empId, status) => {
    if (!isEditingUnlocked) {
      setPendingAction({ empId, status });
      setShowPasswordModal(true);
      return;
    }
    executeStatusChange(empId, status);
  };

  const handleUnlockSuccess = () => {
    setIsEditingUnlocked(true);
    setShowPasswordModal(false);
    if (pendingAction) {
      executeStatusChange(pendingAction.empId, pendingAction.status);
      setPendingAction(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Daily Attendance</h2>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '4px',
            backgroundColor: isFullyMarked ? 'rgba(40, 167, 69, 0.15)' : 'rgba(220, 53, 69, 0.15)',
            border: `1px solid ${isFullyMarked ? '#28a745' : '#dc3545'}`,
            cursor: 'pointer'
          }}
          onClick={() => setShowCalendar(true)}
        >
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: isFullyMarked ? '#155724' : '#721c24' }}>
            {selectedDate.split('-').reverse().join('/')}
          </span>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
        </div>
      </div>

      {showCalendar && (
        <CustomCalendar 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          onClose={() => setShowCalendar(false)} 
          activeEmployees={activeEmployees}
          attendanceRecords={attendanceRecords}
        />
      )}

      {showSavedAlert && (
        <div className="alert alert-success">
          Attendance saved successfully for {selectedDate}!
        </div>
      )}

      {showPasswordModal && (
        <PasswordModal 
          onSuccess={handleUnlockSuccess} 
          onClose={() => {
            setShowPasswordModal(false);
            setPendingAction(null);
          }} 
        />
      )}

      {activeEmployees.length === 0 ? (
        <div className="card text-center">
          <p>No active employees found.</p>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Add employees from the Manage Employees page.</p>
        </div>
      ) : (
        <div className="employee-list mb-4">
          {activeEmployees.map(emp => {
            const isMarked = currentRecords[emp.id] !== undefined;
            const itemStyle = {
              padding: '0.75rem', 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderLeft: isMarked ? '4px solid var(--color-present)' : '4px solid var(--color-absent)',
              backgroundColor: isMarked ? 'rgba(40, 167, 69, 0.05)' : 'rgba(220, 53, 69, 0.05)'
            };
            return (
            <div className="employee-item" style={itemStyle} key={emp.id}>
              <div className="emp-details" style={{ flex: 1, marginRight: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', margin: 0, wordBreak: 'break-word' }}>{emp.name}</h3>
              </div>
              
              <div className="attendance-actions" style={{ marginTop: 0, display: 'flex', gap: '0.25rem' }}>
                <button 
                  className={`att-btn present ${currentRecords[emp.id] === 'Present' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(emp.id, 'Present')}
                  style={{ padding: '0.35rem 0.5rem', flexDirection: 'row', gap: '0.25rem', flex: 'none', width: 'auto' }}
                >
                  <span style={{ fontSize: '0.875rem' }}>🟢</span> <strong style={{ fontSize: '1rem' }}>P</strong>
                </button>
                <button 
                  className={`att-btn absent ${currentRecords[emp.id] === 'Absent' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(emp.id, 'Absent')}
                  style={{ padding: '0.35rem 0.5rem', flexDirection: 'row', gap: '0.25rem', flex: 'none', width: 'auto' }}
                >
                  <span style={{ fontSize: '0.875rem' }}>🔴</span> <strong style={{ fontSize: '1rem' }}>A</strong>
                </button>
                <button 
                  className={`att-btn half ${currentRecords[emp.id] === 'Half Day' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(emp.id, 'Half Day')}
                  style={{ padding: '0.35rem 0.5rem', flexDirection: 'row', gap: '0.25rem', flex: 'none', width: 'auto' }}
                >
                  <span style={{ fontSize: '0.875rem' }}>🟡</span> <strong style={{ fontSize: '1rem' }}>H</strong>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {activeEmployees.length > 0 && (
        <div style={{ marginBottom: '2rem' }}></div>
      )}
    </div>
  );
};

export default Attendance;
