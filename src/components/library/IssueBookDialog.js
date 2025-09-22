import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Snackbar, Checkbox, FormControlLabel, CircularProgress,
    TextField, MenuItem, Select, InputLabel, FormControl, IconButton
} from '@mui/material';
import { LibraryBooks } from '@mui/icons-material';  // Book Icon
import axios from 'axios';

const IssueBookDialog = ({ open, onClose, onSuccess, course, StudentId }) => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);  // Set default to today's date
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);  // Set default to today's date
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortSemester, setSortSemester] = useState('');

    useEffect(() => {
        if (open) fetchBooks();
    }, [open, course]);

    useEffect(() => {
        // Filter books based on search query and sort semester
        let updatedBooks = [...books];
        if (searchQuery) {
            updatedBooks = updatedBooks.filter((book) =>
                book.book_title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (sortSemester) {
            updatedBooks = updatedBooks.filter((book) => book.semester === sortSemester);
        }
        setFilteredBooks(updatedBooks);
    }, [searchQuery, sortSemester, books]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/library/get_sem_books.php?course=${course}`);
            if (res.data.success) {
                setBooks(res.data.data);
            } else {
                setSnackbar({ open: true, message: 'No books found for this course.' });
                setBooks([]);
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error fetching books.' });
        }
        setLoading(false);
    };

    const handleCheckboxChange = async (event, book) => {
        if (event.target.checked) {
            const encodedTitle = encodeURIComponent(book.book_title);  // URL encode the book title
            try {
                const res = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/library/get_available_books.php?title=${encodedTitle}`);
                if (res.data.success && res.data.data.Status === 'Available') {
                    setSelectedBooks((prevSelectedBooks) => {
                        const updatedSelectedBooks = [...prevSelectedBooks, res.data.data];
                        console.log('Selected Books (after adding):', updatedSelectedBooks);
                        return updatedSelectedBooks;
                    });
                } else {
                    setSnackbar({ open: true, message: `${book.book_title} is not available.` });
                }
            } catch (err) {
                setSnackbar({ open: true, message: 'Error checking availability.' });
            }
        } else {
            setSelectedBooks((prevSelectedBooks) =>
                prevSelectedBooks.filter((selectedBook) => selectedBook.BookId !== book.BookId)
            );
            console.log('Selected Books (after removal):', selectedBooks);
        }
    };

    const handleIssue = async () => {
        if (!StudentId || selectedBooks.length === 0) {
            setSnackbar({ open: true, message: 'Please select books and ensure Student ID is available.' });
            return;
        }

        // Construct the payload as expected by the API
        const payload = {
            StudentId: StudentId,
            IssueDate: issueDate,
            ReturnDate: returnDate || issueDate,  // Default ReturnDate to IssueDate if not set
            BookIds: selectedBooks.map((book) => book.BookId)  // Extract BookIds from selectedBooks
        };

        console.log('Payload being sent:', payload);  // Log to verify the format

        try {
            const res = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/library/issue_book.php', payload);
            setLoading(true)
            if (res.data.success) {
                setSnackbar({ open: true, message: 'Books issued successfully!' });
                onSuccess();
                setLoading(false)
                onClose();
            } else {
                setSnackbar({ open: true, message: res.data.message });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Error issuing books.' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogContent>
                    {/* Search and Sort Controls */}
                    <div style={{ marginBottom: '16px' }}>
                        <TextField
                            label="Search Books"
                            variant="outlined"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ marginBottom: '16px' }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Sort by Semester</InputLabel>
                            <Select
                                value={sortSemester}
                                onChange={(e) => setSortSemester(e.target.value)}
                                label="Sort by Semester"
                            >
                                <MenuItem value=""><em>All</em></MenuItem>
                                <MenuItem value="1st SEM">1st SEM</MenuItem>
                                <MenuItem value="2nd SEM">2nd SEM</MenuItem>
                                <MenuItem value="3rd SEM">3rd SEM</MenuItem>
                                <MenuItem value="4th SEM">4th SEM</MenuItem>
                                <MenuItem value="5th SEM">5th SEM</MenuItem>
                                <MenuItem value="6th SEM">6th SEM</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    {/* Loading state or Books list */}
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        filteredBooks.map((book, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        onChange={(event) => handleCheckboxChange(event, book)}
                                    />
                                }
                                label={
                                    <>
                                        <LibraryBooks style={{ marginRight: 8 }} />
                                        {book.book_title} (Semester: {book.semester})
                                    </>
                                }
                            />
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleIssue} variant="contained" color="primary">{loading ? "Loading" : "Issue"}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ open: false, message: '' })}
                message={snackbar.message}
            />
        </>
    );
};

export default IssueBookDialog;
