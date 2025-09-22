import React, { useEffect, useState } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination, Typography, CircularProgress,
    TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

function ListBook({ setView, defaultStatusFilter = '' }) {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(defaultStatusFilter); // ✅ initialize with default

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, books]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/library/list_book.php');
            if (response.data.success) {
                setBooks(response.data.data);
                
                if (defaultStatusFilter) {
                    setStatusFilter(defaultStatusFilter);
                }
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = books;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(book =>
                book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.Author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.Publisher.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== '') {
            filtered = filtered.filter(book => book.Status === statusFilter);
        }

        setFilteredBooks(filtered);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: "space-between", flexWrap: 'wrap', gap: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    onClick={() => setView('dashboard')}
                >
                    Back
                </Button>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>Library Book List</Typography>
                <TextField
                    label="Search by Title/Author/Publisher"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Issued">Issued</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '16px' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#344C7D' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#fff' }}>Book ID</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Title</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Author</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Publisher</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(book => (
                                    <TableRow key={book.Id} hover>
                                        <TableCell>{book.BookId}</TableCell>
                                        <TableCell>{book.Title}</TableCell>
                                        <TableCell>{book.Author}</TableCell>
                                        <TableCell>{book.Publisher}</TableCell>
                                        <TableCell>{book.Status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredBooks.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </Paper>
            )}
        </Box>
    );
}

export default ListBook;
