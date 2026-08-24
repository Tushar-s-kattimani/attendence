import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read employees
    const employeesRef = ref(db, 'employees');
    const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEmployees(Object.values(data));
      } else {
        setEmployees([]);
      }
    });

    // Read attendance
    const attendanceRef = ref(db, 'attendance');
    const unsubscribeAttendance = onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAttendanceRecords(data);
      } else {
        setAttendanceRecords({});
      }
    });

    // Read advances
    const advancesRef = ref(db, 'advances');
    const unsubscribeAdvances = onValue(advancesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAdvances(Object.values(data));
      } else {
        setAdvances([]);
      }
      setLoading(false);
    });

    const fallback = setTimeout(() => setLoading(false), 2000);

    return () => {
      clearTimeout(fallback);
      unsubscribeEmployees();
      unsubscribeAttendance();
      unsubscribeAdvances();
    };
  }, []);

  const addEmployee = (employee) => {
    const newId = Date.now().toString();
    const newEmp = { ...employee, id: newId };
    set(ref(db, `employees/${newId}`), newEmp);
  };

  const updateEmployee = (updatedEmployee) => {
    set(ref(db, `employees/${updatedEmployee.id}`), updatedEmployee);
  };

  const deleteEmployee = (id) => {
    set(ref(db, `employees/${id}`), null);
  };

  const saveDailyAttendance = (date, records) => {
    set(ref(db, `attendance/${date}`), records);
  };

  const getAttendanceForDate = (date) => {
    const records = attendanceRecords[date] || {};
    
    const dayOfWeek = new Date(date).getDay();
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    if (dayOfWeek === 0 && date <= todayStr) {
      const autoRecords = { ...records };
      employees.forEach(emp => {
        if (emp.status !== 'Inactive' && autoRecords[emp.id] === undefined) {
          autoRecords[emp.id] = 'Present';
        }
      });
      return autoRecords;
    }
    
    return records;
  };
  const resetAppData = () => {
    set(ref(db, 'attendance'), null);
    set(ref(db, 'advances'), null);
  };

  const giveAdvance = (employeeId, amount, date, description) => {
    const newId = Date.now().toString();
    const advanceRecord = { id: newId, employeeId, amount: Number(amount), date, description };
    
    // Save to advances
    set(ref(db, `advances/${newId}`), advanceRecord);
  };

  const getEarnedSalaryForMonth = (employeeId, month, year, monthlySalary) => {
    let present = 0;
    let halfDay = 0;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const status = attendanceRecords[dateStr]?.[employeeId];
      
      if (status === 'Present') {
        present++;
      } else if (status === 'Half Day') {
        halfDay++;
      } else if (status === undefined && dayOfWeek === 0 && dateStr <= todayStr) {
        present++;
      }
    }
    
    const currentDailySalary = monthlySalary / daysInMonth;
    const calculated = (present * currentDailySalary) + (halfDay * currentDailySalary * 0.5);
    return Math.round(calculated * 100) / 100;
  };

  const calculateSalary = (employeeId, month, year) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { present: 0, absent: 0, halfDay: 0, totalWorkingDays: 0, calculatedSalary: 0, advanceBalance: 0, advanceDeduction: 0, netPayable: 0 };

    const monthlySalary = Number(employee.salary);
    const daysInTargetMonth = new Date(year, month, 0).getDate();
    const currentDailySalary = monthlySalary / daysInTargetMonth;

    // 1. Current month stats
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    const absentDates = [];
    const halfDayDates = [];
    
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    for (let d = 1; d <= daysInTargetMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const status = attendanceRecords[dateStr]?.[employeeId];
      
      if (status === 'Present') {
        present++;
      } else if (status === 'Absent') {
        absent++;
        absentDates.push(String(d).padStart(2, '0'));
      } else if (status === 'Half Day') {
        halfDay++;
        halfDayDates.push(String(d).padStart(2, '0'));
      } else if (status === undefined && dayOfWeek === 0 && dateStr <= todayStr) {
        present++;
      }
    }

    absentDates.sort((a, b) => parseInt(a) - parseInt(b));
    halfDayDates.sort((a, b) => parseInt(a) - parseInt(b));

    const rawCalculatedSalary = (present * currentDailySalary) + (halfDay * currentDailySalary * 0.5);
    const calculatedSalary = Math.round(rawCalculatedSalary * 100) / 100;
    const totalWorkingDays = present + (halfDay * 0.5);

    // 2. Calculate sequential advance balance up to this month
    const allMonthsSet = new Set();
    Object.keys(attendanceRecords).forEach(date => {
      allMonthsSet.add(date.substring(0, 7));
    });
    const employeeAdvances = advances.filter(a => a.employeeId === employeeId);
    employeeAdvances.forEach(adv => {
      if (adv.date) allMonthsSet.add(adv.date.substring(0, 7));
    });

    const allMonths = Array.from(allMonthsSet).sort();
    
    let runningAdvance = 0;
    
    for (const m of allMonths) {
      const [mYearStr, mMonthStr] = m.split('-');
      const mYear = parseInt(mYearStr, 10);
      const mMonth = parseInt(mMonthStr, 10);
      
      if (mYear > year || (mYear === year && mMonth >= month)) {
        break;
      }
      
      const advancesInM = employeeAdvances
        .filter(a => a.date && a.date.startsWith(m))
        .reduce((sum, a) => sum + Number(a.amount), 0);
        
      runningAdvance += advancesInM;
      
      const salaryInM = getEarnedSalaryForMonth(employeeId, mMonth, mYear, monthlySalary);
      const deductionInM = Math.min(runningAdvance, salaryInM);
      runningAdvance -= deductionInM;
    }

    // Advances IN the target month
    const currentPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const advancesInTargetMonth = employeeAdvances
        .filter(a => a.date && typeof a.date === 'string' && a.date.startsWith(currentPrefix))
        .reduce((sum, a) => sum + Number(a.amount), 0);
        
    runningAdvance += advancesInTargetMonth;

    const advanceBalance = runningAdvance;
    const advanceDeduction = Math.min(calculatedSalary, advanceBalance);
    const netPayable = calculatedSalary - advanceDeduction;

    return {
      present,
      absent,
      halfDay,
      absentDates,
      halfDayDates,
      totalWorkingDays,
      calculatedSalary,
      advanceBalance,
      advanceDeduction,
      netPayable,
      currentDailySalary
    };
  };

  const getRealtimeAdvanceBalance = (employeeId) => {
    const today = new Date();
    const stats = calculateSalary(employeeId, today.getMonth() + 1, today.getFullYear());
    return stats.advanceBalance - stats.advanceDeduction;
  };

  const value = {
    employees,
    attendanceRecords,
    advances,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    saveDailyAttendance,
    getAttendanceForDate,
    resetAppData,
    giveAdvance,
    calculateSalary,
    getRealtimeAdvanceBalance,
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

