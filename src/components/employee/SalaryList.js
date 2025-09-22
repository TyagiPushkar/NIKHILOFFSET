import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    Box,
    // Table,
    // TableBody,
    // TableCell,
    // TableContainer,
    // TableHead,
    // TableRow,
    // Paper,
    Button,
    // TablePagination,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    // IconButton,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

function SalaryList() {
    const [salaries, setSalaries] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchSalaries = async (month, year) => {
        try {
            const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/salary/salary_records.php?month=${month}&year=${year}`);
            if (response.data.success) {
                setSalaries(response.data.data);
            } else {
                console.error('Failed to fetch salary data:', response.data.message);
            }
        } catch (err) {
            console.error('Error fetching salary data:', err);
        }
    };

    useEffect(() => {
        fetchSalaries(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

   

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const exportToCSV = () => {
        const csvRows = [];
        // Add header row
        csvRows.push([
            'Employee ID',
            'Name',
            'Designation',
            'Salary',
            'Total Days in Month',
            'Holidays',
            'Week Offs',
            'Present Days',
            'Leave Days',
            'Actual Working Days',
            'Salary'
        ].join(','));

        // Add data rows
        salaries.forEach((salary) => {
            csvRows.push([
                salary.EmpId,
                salary.Name,
                salary.Designation,
                salary.BasicSalary,
                salary.TotalDaysInMonth,
                salary.Holidays,
                salary.WeekOffs,
                salary.PresentDays,
                salary.LeaveDays,
                salary.ActualWorkingDays,
                salary.Salary
            ].join(','));
        });

        // Create CSV Blob and download
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary_records_${selectedMonth}_${selectedYear}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="h2" sx={{ marginBottom: 2 }}>
                Salary Report
            </Typography>

            {/* Date Range Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small">
                    <InputLabel>Month</InputLabel>
                    <Select value={selectedMonth} onChange={handleMonthChange}>
                        {[...Array(12).keys()].map((i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small">
                    <InputLabel>Year</InputLabel>
                    <Select value={selectedYear} onChange={handleYearChange}>
                        {[2024,2025].map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    size="small"
                    onClick={exportToCSV}
                    sx={{ backgroundColor: '#344C7D' }}
                >
                   Summary <GetAppIcon sx={{ color: 'white' }} />
                </Button>
            </Box>

            {/* <TableContainer component={Paper}>
                <Table size='small'>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            {['Employee ID', 'Name', 'Designation', 'Salary', 'Total Days in Month', 'Holidays', 'Week Offs', 'Present Days', 'Leave Days', 'Actual Working Days', 'Salary'].map((header) => (
                                <TableCell key={header} style={{ color: "white" }}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salaries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                                    No data found
                                </TableCell>
                            </TableRow>
                        ) : (
                            salaries
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((salary) => (
                                    <TableRow key={salary.EmpId}>
                                        <TableCell>{salary.EmpId || 'N/A'}</TableCell>
                                        <TableCell>{salary.Name || 'N/A'}</TableCell>
                                        <TableCell>{salary.Designation || 'N/A'}</TableCell>
                                        <TableCell>{salary.BasicSalary !== undefined ? salary.BasicSalary : 'N/A'}</TableCell>
                                        <TableCell>{salary.TotalDaysInMonth !== undefined ? salary.TotalDaysInMonth : 'N/A'}</TableCell>
                                        <TableCell>{salary.Holidays !== undefined ? salary.Holidays : 'N/A'}</TableCell>
                                        <TableCell>{salary.WeekOffs !== undefined ? salary.WeekOffs : 'N/A'}</TableCell>
                                        <TableCell>{salary.PresentDays !== undefined ? salary.PresentDays : 'N/A'}</TableCell>
                                        <TableCell>{salary.LeaveDays !== undefined ? salary.LeaveDays : 'N/A'}</TableCell>
                                        <TableCell>{salary.ActualWorkingDays !== undefined ? salary.ActualWorkingDays : 'N/A'}</TableCell>
                                        <TableCell>{!isNaN(Number(salary.Salary)) ? Number(salary.Salary).toFixed(2) : 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={salaries.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            /> */}
        </Box>
    );
}

export default SalaryList;
