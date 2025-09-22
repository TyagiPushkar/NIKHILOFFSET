import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, TableFooter,
    TablePagination, Button
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function ViewLeave() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data } = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php', {
                    params: { Tenent_Id: user.tenent_id }
                });
                if (data.success) {
                    setEmployees(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch employees');
            }
        };

        fetchEmployees();
    }, [user.tenent_id]);

    useEffect(() => {

        const fetchLeaves = async () => {
            try {
                const { data } = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/leave/get_leave.php?role=Teacher');

                if (data.success) {
                    const filtered = data.data.filter(leave =>
                        employees.some(emp => emp.EmpId === leave.EmpId)
                    );
                    setLeaves(filtered);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch leaves');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, [employees, user.emp_id]);

    const exportToCsv = () => {
        const csvRows = [['Employee Name', 'Start Date', 'End Date', 'Reason', 'Status']];
        leaves.forEach(({ EmpId, StartDate, EndDate, Reason, Status }) => {
            const emp = employees.find(e => e.EmpId === EmpId);
            csvRows.push([
                emp ? emp.Name : 'Unknown',
                formatDate(StartDate),
                formatDate(EndDate),
                Reason,
                Status
            ]);
        });
        const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'leaves.csv');
        link.click();
    };

    if (loading) return <Box p={3}><CircularProgress /></Box>;
    if (error) return <Typography color="error" p={3}>{error}</Typography>;

    return (
        <Box p={3}>
            <Button
                variant="contained"
                onClick={exportToCsv}
                style={{ backgroundColor: "#344C7D", float: "right", marginBottom: 16 }}
            >
                Export CSV
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            <TableCell sx={{ color: "#fff" }}>Employee Name</TableCell>
                            <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                            <TableCell sx={{ color: "#fff" }}>Reason</TableCell>
                            <TableCell sx={{ color: "#fff" }}>Applied On</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => {
                            const employee = employees.find(e => e.EmpId === leave.EmpId);
                            return (
                                <TableRow key={leave.Id}>
                                    <TableCell>{employee ? employee.Name : 'Unknown'}</TableCell>
                                    <TableCell>{formatDate(leave.StartDate)} - {formatDate(leave.EndDate)}</TableCell>
                                    <TableCell>{leave.Reason}</TableCell>
                                    <TableCell>{formatDate(leave.CreatedAt)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={leaves.length}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ViewLeave;
