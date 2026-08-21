import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read employees
    const employeesRef = ref(db, 'employees');
    const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase employees data:', data);
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
      console.log('Firebase attendance data:', data);
      if (data) {
        setAttendanceRecords(data);
      } else {
        setAttendanceRecords({});
      }
      setLoading(false);
    });

    const fallback = setTimeout(() => setLoading(false), 1500);

    return () => {
      clearTimeout(fallback);
      unsubscribeEmployees();
      unsubscribeAttendance();
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
    return attendanceRecords[date] || {};
  };

  const calculateSalary = (employeeId, month, year) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { present: 0, absent: 0, halfDay: 0, totalWorkingDays: 0, salary: 0 };

    const dailySalary = Number(employee.salary);

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    const absentDates = [];
    const halfDayDates = [];

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    
    Object.keys(attendanceRecords).forEach(date => {
      if (date.startsWith(prefix)) {
        const status = attendanceRecords[date][employeeId];
        if (status === 'Present') {
          present++;
        } else if (status === 'Absent') {
          absent++;
          absentDates.push(date.split('-')[2]);
        } else if (status === 'Half Day') {
          halfDay++;
          halfDayDates.push(date.split('-')[2]);
        }
      }
    });

    absentDates.sort((a, b) => parseInt(a) - parseInt(b));
    halfDayDates.sort((a, b) => parseInt(a) - parseInt(b));

    const calculatedSalary = (present * dailySalary) + (halfDay * dailySalary * 0.5);
    const totalWorkingDays = present + (halfDay * 0.5);

    return {
      present,
      absent,
      halfDay,
      absentDates,
      halfDayDates,
      totalWorkingDays,
      calculatedSalary: Math.round(calculatedSalary)
    };
  };

  const value = {
    employees,
    attendanceRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    saveDailyAttendance,
    getAttendanceForDate,
    calculateSalary,
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
