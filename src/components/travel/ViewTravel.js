import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableFooter, TablePagination, Button, IconButton } from '@mui/material';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../auth/AuthContext';

function ViewTravel({ EmpId }) {
    const [travelExpenses, setTravelExpenses] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { user } = useAuth();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

   useEffect(() => {
    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php', {
                params: { Tenent_Id: user.tenent_id }
            });

            if (response.data.success) {
                // Filter employees by Tenent_Id
                const filteredEmployees = response.data.data.filter(emp => emp.Tenent_Id === user.tenent_id);
                setEmployeeData(filteredEmployees);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error fetching employee data');
            console.error('Error:', error);
        }
    };

    fetchEmployeeData();
}, [user.tenent_id]);

useEffect(() => {
    const fetchTravelExpenses = async () => {
        try {
            if (!EmpId) {
                setError('Employee ID is missing');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/travel/get_travel.php', {
                params: { empId: user.emp_id, role: user.role }
            });

            if (response.data.success) {
                // Filter travel expenses by EmpId matching Tenent_Id
                const updatedTravelExpenses = response.data.data.filter(expense => 
                    employeeData.some(emp => emp.EmpId === expense.empId && emp.Tenent_Id === user.tenent_id)
                );

                // Map travel expenses with employee names
                const travelWithNames = updatedTravelExpenses.map(expense => {
                    const employee = employeeData.find(emp => emp.EmpId === expense.empId);
                    return {
                        ...expense,
                        employeeName: employee ? employee.Name : 'Unknown'
                    };
                });
                setTravelExpenses(travelWithNames);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error fetching travel expenses data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchTravelExpenses();
}, [EmpId, user.emp_id, user.role, employeeData, user.tenent_id]);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (id, status) => {
        try {
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/travel/update_status.php', {
                id,
                status
            });

            if (response.data.success) {
                setTravelExpenses(travelExpenses.map(expense =>
                    expense.id === id ? { ...expense, status } : expense
                ));
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error updating travel status');
            console.error('Error:', error);
        }
    };

    const exportToCsv = () => {
        const csvRows = [
            ['Employee Name', 'Date', 'Destination', 'From', 'To', 'Type', 'Status']
        ];

        travelExpenses.forEach(({ employeeName, travelDate, travelDestination, travelFrom, travelTo, travelType, status }) => {
            csvRows.push([
                employeeName,
                formatDate(travelDate),
                travelDestination,
                travelFrom,
                travelTo,
                travelType,
                status
            ]);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'travel.csv');
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                onClick={exportToCsv}
                style={{ marginBottom: '16px', backgroundColor: "#344C7D", float: "right" }}
            >
                Export CSV
            </Button>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead style={{ backgroundColor: "#344C7D" }}>
                                <TableRow>
                                    <TableCell style={{ color: "white" }}>Employee Name</TableCell>
                                    <TableCell style={{ color: "white" }}>Date</TableCell>
                                    <TableCell style={{ color: "white" }}>Destination</TableCell>
                                    <TableCell style={{ color: "white" }}>From</TableCell>
                                    <TableCell style={{ color: "white" }}>To</TableCell>
                                    <TableCell style={{ color: "white" }}>Type</TableCell>
                                    <TableCell style={{ color: "white" }}>Status</TableCell>
                                    {user && user.role === 'HR' ? <TableCell style={{ color: "white" }}>Actions</TableCell> : null}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {travelExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.employeeName}</TableCell>
                                        <TableCell>{formatDate(expense.travelDate)}</TableCell>
                                        <TableCell>{expense.travelDestination}</TableCell>
                                        <TableCell>{expense.travelFrom}</TableCell>
                                        <TableCell>{expense.travelTo}</TableCell>
                                        <TableCell>{expense.travelType}</TableCell>
                                        <TableCell>{expense.status}</TableCell>
                                        {user && user.role === "HR" && (
                                            <TableCell>
                                                {expense.status === 'Pending' && (
                                                    <>
                                                        <IconButton onClick={() => handleStatusChange(expense.id, 'Approved')} color="primary">
                                                            <CheckIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleStatusChange(expense.id, 'Rejected')} color="secondary">
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        count={travelExpenses.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}

export default ViewTravel;
