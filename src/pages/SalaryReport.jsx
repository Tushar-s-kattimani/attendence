import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

const SalaryReport = () => {
  const { employees, calculateSalary } = useAppContext();
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const activeEmployees = employees.filter(e => e.status !== 'Inactive');

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const yearOptions = [];
  for (let i = today.getFullYear() - 2; i <= today.getFullYear() + 1; i++) {
    yearOptions.push(i);
  }

  const reportData = useMemo(() => {
    return activeEmployees.map(emp => {
      const stats = calculateSalary(emp.id, selectedMonth, selectedYear);
      return {
        ...emp,
        ...stats
      };
    });
  }, [activeEmployees, calculateSalary, selectedMonth, selectedYear]);

  const totalPayout = reportData.reduce((sum, emp) => sum + emp.calculatedSalary, 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set font to a classic Serif style (closest standard built-in to Bookman)
    doc.setFont("times", "roman");
    
    // Get page width to center text
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add Title
    doc.setFontSize(18);
    doc.text('Shri Gajanan Enterprises Ghataprabha - Salary Report', pageWidth / 2, 22, { align: 'center' });
    
    // Add Date Range subtitle
    doc.setFontSize(12);
    const monthName = monthOptions.find(m => m.value === selectedMonth)?.label || '';
    const startDateStr = `01/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
    
    // Set end date to today's date (PDF downloaded date)
    const downloadDate = new Date();
    const endDateStr = `${String(downloadDate.getDate()).padStart(2, '0')}/${String(downloadDate.getMonth() + 1).padStart(2, '0')}/${downloadDate.getFullYear()}`;
    
    doc.text(`Salary Period: ${startDateStr} to ${endDateStr}`, pageWidth / 2, 30, { align: 'center' });
    
    // Prepare table data
    const tableColumn = ["Sl.No", "Employee Name", "Working Days", "Present", "Absent", "Half Day", "Total Salary (Rs)"];
    const tableRows = [];
    
    reportData.forEach((emp, index) => {
      const rowData = [
        (index + 1).toString(),
        emp.name,
        emp.totalWorkingDays.toString(),
        emp.present.toString(),
        emp.absent.toString(),
        emp.halfDay.toString(),
        emp.calculatedSalary.toString()
      ];
      tableRows.push(rowData);
    });
    
    // Add total row at the end
    tableRows.push(["", "", "", "", "", "Total Payout", totalPayout.toString()]);
    
    // Generate table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40, // Increased slightly to make room for border
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], font: 'times', fontSize: 11 },
      didDrawPage: function (data) {
        // Draw page border
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0); // Black
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      }
    });
    
    // Save PDF
    doc.save(`salary_report_${monthName}_${selectedYear}.pdf`);
  };

  return (
    <div>
      <div className="mb-4">
        <h2>Salary Report</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Calculated based on Daily Salary</p>
      </div>

      <div className="card grid-2 mb-4">
        <div className="form-group mb-0">
          <label className="form-label">Month</label>
          <select 
            className="form-control" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <button className="btn btn-secondary" onClick={downloadPDF} disabled={reportData.length === 0}>
          <Download size={18} /> Download PDF
        </button>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <h3 style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.25rem' }}>Total Estimated Payout</h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          ₹{totalPayout.toLocaleString('en-IN')}
        </div>
      </div>

      {reportData.length === 0 ? (
        <div className="card text-center">
          <p>No active employees found.</p>
        </div>
      ) : (
        <div className="table-container mb-4">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-center">Working Days</th>
                <th className="text-center">P / A / H</th>
                <th style={{ textAlign: 'right' }}>Calculated Salary</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>₹{emp.salary}/day</div>
                  </td>
                  <td className="text-center font-medium">
                    {emp.totalWorkingDays}
                  </td>
                  <td className="text-center" style={{ fontSize: '0.75rem', color: 'black' }}>
                    <strong><span>{emp.present}</span></strong> / <strong><span>{emp.absent}</span></strong> / <strong><span>{emp.halfDay}</span></strong>
                    {emp.absentDates && emp.absentDates.length > 0 && (
                      <div className="mt-1" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>
                        <strong>Absent on:</strong> <strong>{emp.absentDates.join(', ')}</strong>
                      </div>
                    )}
                    {emp.halfDayDates && emp.halfDayDates.length > 0 && (
                      <div className="mt-1" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>
                        <strong>Half Day on:</strong> <strong>{emp.halfDayDates.join(', ')}</strong>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'black' }}>
                    ₹{emp.calculatedSalary.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ height: '2rem' }}></div>
    </div>
  );
};

export default SalaryReport;
