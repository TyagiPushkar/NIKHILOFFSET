import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    // Table,
    // TableBody,
    // TableCell,
    // TableContainer,
    // TableHead,
    // TableRow,
    // Paper,
} from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useAuth } from '../auth/AuthContext';

const AttendanceReport = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filteredAttendance, setFilteredAttendance] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`);
                if (response.data.success) {
                    setEmployees(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        const fetchAttendance = async () => {
            try {
                const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/attendance/get_attendance.php');
                if (response.data.success) {
                    setAttendance(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
            }
        };

        fetchEmployees();
        fetchAttendance();
    }, []);

    useEffect(() => {
        const filterAttendance = () => {
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);

            const filtered = attendance.filter((record) => {
                const recordDate = new Date(record.InTime);
                return recordDate >= startDate && recordDate <= endDate;
            });

            setFilteredAttendance(filtered);
        };

        if (fromDate && toDate) {
            filterAttendance();
        }
    }, [fromDate, toDate, attendance]);

   const exportAttendanceToCSV = () => {
    if (!filteredAttendance.length) {
        alert("No data available for export.");
        return;
    }

    // Extracting unique dates from attendance records
    const uniqueDates = [...new Set(filteredAttendance.map(record => record.InTime.split(' ')[0]))].sort();

    // Constructing the CSV Header
    const csvHeader = ["S. No.", "Employee Name", ...uniqueDates.flatMap(date => [date + " In", date + " Out"])];

    // Constructing the CSV Rows
    const csvRows = employees.map((employee, index) => {
        const row = [index + 1, employee.Name];

        uniqueDates.forEach(date => {
            // Filter attendance records for the employee on a specific date
            const attendanceRecords = filteredAttendance.filter(record =>
                record.EmpId === employee.EmpId && record.InTime.startsWith(date)
            );

            if (attendanceRecords.length > 0) {
                // If attendance exists, extract In and Out times
                const inTime = attendanceRecords[0].InTime.split(' ')[1] || "";
                const outTime = attendanceRecords[0].OutTime ? attendanceRecords[0].OutTime.split(' ')[1] : "";
                row.push(inTime, outTime);
            } else {
                // If no attendance record, mark as "Absent" or "WO" (week off)
                row.push("Absent", "Absent");
            }
        });

        return row;
    });

    // Convert data to CSV format
    const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "attendance_report.csv");
};

    // const uniqueDates = [...new Set(filteredAttendance.map(record => record.InTime.split(' ')[0]))].sort();


    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="h2" sx={{ marginBottom: 2 }}>
                 Attendance Report
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="From Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    sx={{ width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="To Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    sx={{ width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={exportAttendanceToCSV} size="small" style={{ backgroundColor: '#344C7D' }}>
                    <GetAppIcon />
                </Button>
            </Box>

           
{/* {filteredAttendance.length > 0 && (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell rowSpan={2}>S. No.</TableCell>
                    <TableCell rowSpan={2}>Employee Name</TableCell>
                    {uniqueDates.map((date) => (
                        <TableCell key={date} colSpan={2} align="center">
                            {date}
                        </TableCell>
                    ))}
                </TableRow>
                <TableRow>
                    {uniqueDates.map((date) => (
                        <>
                            <TableCell key={date + "-in"} align="center">In Time</TableCell>
                            <TableCell key={date + "-out"} align="center">Out Time</TableCell>
                        </>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {employees.map((employee, index) => (
                    <TableRow key={employee.EmpId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{employee.Name}</TableCell>
                        {uniqueDates.map((date) => {
                            const attendanceRecords = filteredAttendance.filter(
                                (record) =>
                                    record.EmpId === employee.EmpId &&
                                    record.InTime.startsWith(date)
                            );

                            let inTime = "Absent";
                            let outTime = "Absent";

                            if (attendanceRecords.length > 0) {
                                inTime = attendanceRecords[0].InTime.split(" ")[1] || "";
                                outTime = attendanceRecords[0].OutTime
                                    ? attendanceRecords[0].OutTime.split(" ")[1]
                                    : "";
                            }

                            return (
                                <>
                                    <TableCell align="center">{inTime}</TableCell>
                                    <TableCell align="center">{outTime}</TableCell>
                                </>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)} */}

        </Box>
    );
};

export default AttendanceReport;
