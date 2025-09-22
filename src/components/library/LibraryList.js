import React, { useState, useEffect } from 'react';
import {
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Snackbar, TablePagination,
    TableFooter, TextField
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';

const LibraryList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchLibraryTransactions();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [transactions, searchQuery]);

    const fetchLibraryTransactions = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/students/get_student.php');
            if (response.data.success) {
                const sorted = response.data.data.sort((a, b) => b.TransactionId - a.TransactionId);
                setTransactions(sorted);
                setFilteredTransactions(sorted);
            } else {
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            }
        } catch (error) {
            setSnackbarMessage('Error fetching library transactions.');
            setOpenSnackbar(true);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lower = query.toLowerCase();
        const filtered = transactions.filter(tx =>
            (tx.StudentID && tx.StudentID.toLowerCase().includes(lower)) ||
            (tx.CandidateName && tx.CandidateName.toLowerCase().includes(lower))
        );
        setFilteredTransactions(filtered);
        setPage(0); // Reset to first page
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewClick = (studentId) => {
        navigate(`/student/library/${studentId}`);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                <h2>Library</h2>
                <TextField
                    label="Search by Student ID or Name"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}>Student ID</TableCell>
                            <TableCell style={{ color: "white" }}>Student Name</TableCell>
                            <TableCell style={{ color: "white" }}>Course</TableCell>
                            <TableCell style={{ color: "white" }}>Sem</TableCell>
                            <TableCell style={{ color: "white" }}>Book Issue</TableCell>
                            {/* <TableCell style={{ color: "white" }}>Book Return</TableCell> */}
                            <TableCell style={{ color: "white" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransactions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((tx) => (
                                <TableRow key={tx.TransactionId || tx.StudentID}>
                                    <TableCell>{tx.StudentID}</TableCell>
                                    <TableCell>{tx.CandidateName}</TableCell>
                                    <TableCell>{tx.Course}</TableCell>
                                    <TableCell>{tx.Sem}</TableCell>
                                    <TableCell>{tx.BookIssue}</TableCell>
                                    {/* <TableCell>{tx.BookReturn}</TableCell> */}
                                    <TableCell>
                                      
                                        <VisibilityIcon
                                                                                        color="primary"
                                                                                        sx={{ cursor: 'pointer' }}
                                                                                        onClick={() => handleViewClick(tx.StudentID)}
                                                                                    />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={filteredTransactions.length}
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

export default LibraryList;
