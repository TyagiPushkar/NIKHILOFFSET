import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    TablePagination,
    TableFooter,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const RegulariseList = () => {
    const { user } = useAuth();
    const [regularisations, setRegularisations] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedReg, setSelectedReg] = useState(null);

    useEffect(() => {
        fetchRegularisations();
    }, [page, rowsPerPage]);

    const fetchRegularisations = async () => {
        try {
            const params = { role: user.role, EmpId: user.emp_id };
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/attendance/get_regularise.php', { params });
            if (response.data.success) {
                setRegularisations(response.data.data);
            } else {
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            }
        } catch (error) {
            setSnackbarMessage('Error fetching regularisations.');
            setOpenSnackbar(true);
        }
    };

    const handleMenuClick = (event, reg) => {
        setAnchorEl(event.currentTarget);
        setSelectedReg(reg);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleStatusChange = async (status) => {
        if (!selectedReg) return;

        try {
            const updateDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            const updatedBy = user.emp_id; // Get EmpId from user object

            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/attendance/update_regularise.php', {
                RegID: selectedReg.RegID,
                Status: status,
                UpdateDate: updateDate,
                UpdatedBy: updatedBy,
                InActivityId: selectedReg.InActivityId,
                OutActivityId: selectedReg.OutActivityId,
                InTime: selectedReg.InTime,
                OutTime: selectedReg.OutTime,
                Date: selectedReg.Date
            });

            if (response.data.success) {
                setSnackbarMessage('Status updated successfully.');
                fetchRegularisations(); // Refresh the list
            } else {
                setSnackbarMessage(response.data.message);
            }
        } catch (error) {
            setSnackbarMessage('Error updating status.');
        } finally {
            setOpenSnackbar(true);
            handleMenuClose();
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <Typography variant="h5">Regularisation Requests</Typography>
            <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                <Table>
                    <TableHead style={{ backgroundColor: '#344C7D' }}>
                        <TableRow>
                            <TableCell style={{ color: 'white' }}>Employee</TableCell>
                            <TableCell style={{ color: 'white' }}>Date</TableCell>
                            <TableCell style={{ color: 'white' }}>In Time</TableCell>
                            <TableCell style={{ color: 'white' }}>Out Time</TableCell>
                            <TableCell style={{ color: 'white' }}>Reason</TableCell>
                            <TableCell style={{ color: 'white' }}>Status</TableCell>
                            {user.role === 'HR' && <TableCell style={{ color: 'white' }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {regularisations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((reg) => (
                            <TableRow key={reg.RegID}>
                                <TableCell>{reg.EmpId}</TableCell>
                                <TableCell>{new Date(reg.Date).toLocaleDateString()}</TableCell>
                                <TableCell>{reg.InTime}</TableCell>
                                <TableCell>{reg.OutTime}</TableCell>
                                <TableCell>{reg.Reason}</TableCell>
                                <TableCell>{reg.Status}</TableCell>
                                {user.role === 'HR' && (
                                    <TableCell>
                                        <IconButton onClick={(e) => handleMenuClick(e, reg)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                            <MenuItem onClick={() => handleStatusChange('Approved')}>Approve</MenuItem>
                                            <MenuItem onClick={() => handleStatusChange('Rejected')}>Reject</MenuItem>
                                        </Menu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={regularisations.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default RegulariseList;
