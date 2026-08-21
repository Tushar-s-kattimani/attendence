import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Users, CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { employees, getAttendanceForDate } = useAppContext();
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const displayDate = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  const todayAttendance = getAttendanceForDate(todayStr);

  let present = 0;
  let absent = 0;
  let halfDay = 0;
  const absentNames = [];
  const halfDayNames = [];

  activeEmployees.forEach(emp => {
    const status = todayAttendance[emp.id];
    if (status === 'Present') {
      present++;
    } else if (status === 'Absent') {
      absent++;
      absentNames.push(emp.name);
    } else if (status === 'Half Day') {
      halfDay++;
      halfDayNames.push(emp.name);
    }
  });

  const totalMarked = present + absent + halfDay;
  const totalEmployees = activeEmployees.length;
  const attendancePercentage = totalEmployees > 0 ? Math.round(((present + (halfDay * 0.5)) / totalEmployees) * 100) : 0;
  const isComplete = totalMarked === totalEmployees && totalEmployees > 0;

  return (
    <div>
      <div className="mb-4 fade-in-up">
        <h2 className="mb-1" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Overview</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>{displayDate}</p>
      </div>

      <div className="grid-2 mb-4 fade-in-up delay-100">
        <div className="stat-card total">
          <Users size={24} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', opacity: 0.8 }} />
          <div className="stat-value">{totalEmployees}</div>
          <div className="stat-label">Total Staff</div>
        </div>
        <div className="stat-card present">
          <CheckCircle size={24} style={{ color: 'var(--color-present)', marginBottom: '0.5rem', opacity: 0.8 }} />
          <div className="stat-value text-green">{present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card absent">
          <XCircle size={24} style={{ color: 'var(--color-absent)', marginBottom: '0.5rem', opacity: 0.8 }} />
          <div className="stat-value text-red">{absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card half">
          <Clock size={24} style={{ color: 'var(--color-half)', marginBottom: '0.5rem', opacity: 0.8 }} />
          <div className="stat-value" style={{ color: 'var(--color-half)' }}>{halfDay}</div>
          <div className="stat-label">Half Day</div>
        </div>
      </div>

      <div className="card mb-4 fade-in-up delay-200">
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Attendance Progress</h3>
          <span style={{ fontWeight: '700', color: isComplete ? 'var(--color-present)' : 'var(--color-primary)', fontSize: '1.25rem' }}>
            {attendancePercentage}%
          </span>
        </div>
        <div className="glow-progress-bg">
          <div 
            className={`glow-progress-bar ${isComplete ? 'complete' : ''}`}
            style={{ width: `${totalEmployees > 0 ? (totalMarked / totalEmployees) * 100 : 0}%` }} 
          />
        </div>
        <p className="text-center mt-3" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
          {totalMarked} of {totalEmployees} marked today
        </p>
      </div>

      {(absentNames.length > 0 || halfDayNames.length > 0) && (
        <div className="card mb-4 fade-in-up delay-300">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Today's Exceptions</h3>
          {absentNames.length > 0 && (
            <div className="mb-3" style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700' }} className="text-red">Absent: </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{absentNames.join(', ')}</span>
            </div>
          )}
          {halfDayNames.length > 0 && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-half)' }}>Half Day: </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{halfDayNames.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="fade-in-up delay-300">
        <button className="btn btn-primary" onClick={() => navigate('/attendance')} style={{ padding: '1rem' }}>
          <CalendarCheck size={20} /> Mark Attendance Now
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/employees')} style={{ padding: '1rem' }}>
          <Users size={20} /> Manage Employees
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
